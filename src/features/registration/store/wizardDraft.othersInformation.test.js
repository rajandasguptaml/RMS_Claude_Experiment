import { describe, it, expect, beforeEach } from 'vitest'
import { useWizardDraft } from './wizardDraft.js'

function getA() {
  return useWizardDraft.getState().registration.othersInformation.sectionA
}
function getCard() {
  return useWizardDraft.getState().registration.othersInformation.cardGuarantee
}

describe('wizardDraft — othersInformation slice', () => {
  beforeEach(() => {
    useWizardDraft.getState().resetDraft()
  })

  describe('setOthersSectionA — mutual exclusivity (BR-OI-001)', () => {
    it('setting complimentaryGuest=YES resets houseUse + roomOwner', () => {
      useWizardDraft.getState().setOthersSectionA({ houseUse: 'YES' })
      useWizardDraft.getState().setOthersSectionA({ roomOwner: 'YES' })
      useWizardDraft.getState().setOthersSectionA({ complimentaryGuest: 'YES' })
      const a = getA()
      expect(a.complimentaryGuest).toBe('YES')
      expect(a.houseUse).toBe('')
      expect(a.roomOwner).toBe('')
    })

    it('setting houseUse=YES resets the other two', () => {
      useWizardDraft.getState().setOthersSectionA({ complimentaryGuest: 'YES' })
      useWizardDraft.getState().setOthersSectionA({ houseUse: 'YES' })
      const a = getA()
      expect(a.houseUse).toBe('YES')
      expect(a.complimentaryGuest).toBe('')
      expect(a.roomOwner).toBe('')
    })

    it('setting any flag to NO does not reset the others', () => {
      useWizardDraft.getState().setOthersSectionA({ houseUse: 'YES' })
      useWizardDraft.getState().setOthersSectionA({ complimentaryGuest: 'NO' })
      expect(getA().houseUse).toBe('YES')
    })
  })

  describe('setCardGuaranteeTokenized — PCI defence', () => {
    it('strips pan from incoming patch', () => {
      useWizardDraft.getState().setCardGuaranteeTokenized({
        pan: '4242424242424242',
        token: 'tok_abc',
        last4: '4242',
      })
      const card = getCard()
      expect(card).not.toHaveProperty('pan')
      expect(card.token).toBe('tok_abc')
      expect(card.last4).toBe('4242')
    })

    it('strips cvv from incoming patch', () => {
      useWizardDraft.getState().setCardGuaranteeTokenized({
        cvv: '123',
        cardType: 'Visa Card',
      })
      const card = getCard()
      expect(card).not.toHaveProperty('cvv')
      expect(card.cardType).toBe('Visa Card')
    })

    it('accepts the clean tokenized shape', () => {
      useWizardDraft.getState().setCardGuaranteeTokenized({
        cardType: 'Master Card',
        cardHolderName: 'Jane Doe',
        expiryMonth: '12',
        expiryYear: '2030',
        cardReference: 'AUTH-001',
        token: 'tok_xyz',
        last4: '1111',
      })
      const card = getCard()
      expect(card.cardType).toBe('Master Card')
      expect(card.cardHolderName).toBe('Jane Doe')
      expect(card.token).toBe('tok_xyz')
    })

    it('initial shape has no pan field', () => {
      const card = getCard()
      expect(Object.keys(card).includes('pan')).toBe(false)
    })
  })

  describe('clearCardGuarantee + resetOthersInformation', () => {
    it('clearCardGuarantee wipes only the card slot', () => {
      useWizardDraft.getState().setCardGuaranteeTokenized({ token: 'tok', last4: '9999' })
      useWizardDraft.getState().setOthersSectionA({ comingFrom: 'Dhaka' })
      useWizardDraft.getState().clearCardGuarantee()
      expect(getCard().token).toBe('')
      expect(getA().comingFrom).toBe('Dhaka') // untouched
    })

    it('resetOthersInformation wipes everything in the slice', () => {
      useWizardDraft.getState().setOthersSectionA({ comingFrom: 'Dhaka' })
      useWizardDraft.getState().setCardGuaranteeTokenized({ token: 'tok', last4: '9999' })
      useWizardDraft.getState().resetOthersInformation()
      expect(getA().comingFrom).toBe('')
      expect(getCard().token).toBe('')
    })
  })

  describe('PCI property — PAN must NEVER appear in serialized state', () => {
    it('after rogue setCardGuaranteeTokenized with pan, the full state JSON has no PAN string', () => {
      const rogue = '4242424242424242'
      useWizardDraft.getState().setCardGuaranteeTokenized({
        pan: rogue,
        cvv: '999',
        token: 'tok_abc',
        last4: '4242',
      })
      const json = JSON.stringify(useWizardDraft.getState())
      expect(json).not.toContain(rogue)
      expect(json).not.toContain('999')
    })
  })
})
