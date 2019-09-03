import React, { useState, useMemo } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { useAuth0 } from 'react-auth0-wrapper'
import { FaSave } from 'react-icons/fa'
import ReactTooltip from 'react-tooltip'
import { useSubscription } from 'context/useSubscription'
import { factionNames, selections, realmscape } from 'ducks'
import { ISavedArmy } from 'types/savedArmy'
import { IStore } from 'types/store'
import { SaveArmyModal } from './save_army_modal'
import { IAllySelections } from 'types/selections'

const btnClass = `btn btn-outline-dark btn-block`
const btnContentWrapper = `d-flex align-items-center justify-content-center`

const armyHasEntries = (army: ISavedArmy) => {
  const { allySelections, realmscape_feature, realmscape, selections } = army

  if (Object.values(selections).some(x => x.length)) return true
  if (Object.values(allySelections).some(x => Object.values(x as IAllySelections).some(x => x.length)))
    return true
  if (realmscape || realmscape_feature) return true

  return false
}

const SaveArmyBtnComponent: React.FC<ISavedArmy> = currentArmy => {
  const { isAuthenticated, loginWithRedirect } = useAuth0()
  const { isSubscribed } = useSubscription()

  const canSave = useMemo(() => armyHasEntries(currentArmy), [currentArmy])

  const [modalIsOpen, setModalIsOpen] = useState(false)

  const openModal = () => setModalIsOpen(true)
  const closeModal = () => setModalIsOpen(false)

  const btnText = isAuthenticated ? `Save Army` : `Log in to save this army`

  return (
    <>
      {!isAuthenticated && <SaveButton btnText={btnText} handleClick={loginWithRedirect} />}

      {isAuthenticated && !isSubscribed && <SubscribeBtn />}

      {isAuthenticated && isSubscribed && !canSave && (
        <SaveButton btnText={btnText} handleClick={() => null} showTooltip={true} />
      )}

      {isAuthenticated && isSubscribed && canSave && <SaveButton btnText={btnText} handleClick={openModal} />}

      <SaveArmyModal army={currentArmy} modalIsOpen={modalIsOpen} closeModal={closeModal} />
    </>
  )
}

const mapStateToProps = (state: IStore, ownProps) => ({
  ...ownProps,
  allyFactionNames: selections.selectors.getAllyFactionNames(state),
  allySelections: selections.selectors.getAllySelections(state),
  factionName: factionNames.selectors.getFactionName(state),
  realmscape_feature: realmscape.selectors.getRealmscapeFeature(state),
  realmscape: realmscape.selectors.getRealmscape(state),
  selections: selections.selectors.getSelections(state),
})

export const SaveArmyBtn = connect(
  mapStateToProps,
  null
)(SaveArmyBtnComponent)

const SubscribeBtn = () => (
  <Link to="/subscribe" className={btnClass}>
    <div className={btnContentWrapper}>
      <FaSave className="mr-2" /> Save Army
    </div>
  </Link>
)

interface ISaveButtonProps {
  handleClick: () => void
  btnText: string
  showTooltip?: boolean
}

const SaveButton = ({ handleClick, btnText, showTooltip = false }: ISaveButtonProps) => {
  const tipProps = {
    'data-for': 'cantSaveButton',
    'data-multiline': true,
    'data-tip': `Add some stuff to your army before saving!`,
    'data-type': 'warning',
  }

  return (
    <>
      <button className={btnClass} onClick={handleClick} {...tipProps}>
        <div className={btnContentWrapper}>
          <FaSave className="mr-2" /> {btnText}
        </div>
      </button>

      <ReactTooltip id={`cantSaveButton`} disable={!showTooltip} />
    </>
  )
}

const CantSaveButton = () => {
  const tipProps = {
    'data-for': 'cantSaveButton',
    'data-multiline': true,
    'data-tip': `Add some stuff to your army before saving!`,
    'data-type': 'warning',
  }

  return (
    <>
      <button className={btnClass} onClick={e => e.preventDefault()} {...tipProps}>
        <div className={btnContentWrapper}>
          <FaSave className="mr-2" /> Save Army
        </div>
      </button>
      <ReactTooltip id={`cantSaveButton`} />
    </>
  )
}
