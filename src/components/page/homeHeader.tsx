import React, { Suspense, lazy, useEffect } from 'react'
import Switch from 'react-switch'
import { connect } from 'react-redux'
import { factionNames, selections, selectors, realmscape } from 'ducks'
import { FaDice, FaEdit } from 'react-icons/fa'
import { useTheme } from 'context/useTheme'
import { useSavedArmies } from 'context/useSavedArmies'
import { useAppStatus } from 'context/useAppStatus'
import { IStore } from 'types/store'
import { withSelectOne } from 'utils/withSelect'
import { logFactionSwitch } from 'utils/analytics'
import { componentWithSize } from 'utils/mapSizesToProps'
import { titleCase } from 'utils/textUtils'
import { getArmyLink } from 'utils/handleQueryParams'
import { LoadingHeader } from 'components/helpers/suspenseFallbacks'
import { SelectOne } from 'components/input/select'
import { LinkNewTab } from 'components/helpers/link'
import { SUPPORTED_FACTIONS, TSupportedFaction } from 'meta/factions'

const Navbar = lazy(() => import('./navbar'))

export const Header = props => {
  const { theme } = useTheme()
  return (
    <div className={theme.headerColor}>
      <Suspense fallback={<LoadingHeader />}>
        <Navbar />
      </Suspense>
      <Jumbotron />
    </div>
  )
}

interface IJumbotronProps {
  factionName: TSupportedFaction
  hasSelections: boolean
  isMobile: boolean
  resetAllySelections: () => void
  resetRealmscapeStore: () => void
  resetSelections: () => void
  setFactionName: (value: string | null) => void
}

const JumbotronComponent: React.FC<IJumbotronProps> = props => {
  const {
    factionName,
    hasSelections,
    isMobile,
    resetAllySelections,
    resetRealmscapeStore,
    resetSelections,
    setFactionName,
  } = props
  const { isOnline, isGameMode } = useAppStatus()
  const { setLoadedArmy, getFavoriteFaction, favoriteFaction, loadedArmy } = useSavedArmies()
  const { theme } = useTheme()

  // Get our user's favorite faction from localStorage/API
  useEffect(() => {
    getFavoriteFaction()
  }, [getFavoriteFaction])

  // Set our favorite faction
  useEffect(() => {
    if (favoriteFaction && !hasSelections && getArmyLink() === null) {
      setFactionName(favoriteFaction)
    }
    // Don't want to refresh this on hasSelections, so we need to ignore that piece of state
    // eslint-disable-next-line
  }, [favoriteFaction, setFactionName])

  const setValue = withSelectOne((value: string | null) => {
    setLoadedArmy(null)
    resetSelections()
    resetRealmscapeStore()
    resetAllySelections()
    if (isOnline) logFactionSwitch(value)
    setFactionName(value)
  })

  const jumboClass = `jumbotron jumbotron-fluid text-center ${theme.headerColor} d-print-none mb-0 pt-4 ${
    isMobile ? `pb-2` : `pb-3`
  }`

  return (
    <div className={jumboClass}>
      <div className="container">
        <h1 className="display-5 text-white">Age of Sigmar Reminders</h1>
        <p className="mt-3 mb-1 d-none d-sm-block text-white">
          By Davis E. Ford -{' '}
          <LinkNewTab className="text-white" href="//daviseford.com" label={'Davis E. Ford website'}>
            daviseford.com
          </LinkNewTab>
        </p>
        <ToggleGameMode />
        {isGameMode ? (
          <div className={`d-flex pt-3 pb-2 justify-content-center`}>
            <h2 className="display-6 text-white">{titleCase(factionName)}</h2>
            {loadedArmy && <h3 className={theme.textSecondary}>{loadedArmy.armyName}</h3>}
          </div>
        ) : (
          <>
            <span className="text-white">Select your army to get started:</span>
            <div className={`d-flex pt-3 pb-2 justify-content-center`}>
              <div className="col-12 col-sm-9 col-md-6 col-lg-4 text-left">
                <SelectOne
                  value={titleCase(factionName)}
                  items={SUPPORTED_FACTIONS}
                  setValue={setValue}
                  hasDefault={true}
                  toTitle={true}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const ToggleGameMode = () => {
  const { isGameMode, toggleGameMode } = useAppStatus()

  return (
    <div className="text-white">
      <label htmlFor="visual-theme-switch">
        <FaEdit className="mr-2" size={32} />
        <Switch
          onChange={toggleGameMode}
          checked={isGameMode}
          onColor="#1C7595"
          onHandleColor="#E9ECEF"
          handleDiameter={36}
          uncheckedIcon={false}
          checkedIcon={false}
          boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
          activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
          height={26}
          width={80}
          className="react-switch"
          id="visual-theme-switch"
        />
        <FaDice className="ml-2" size={32} />
      </label>
    </div>
  )
}

const mapStateToProps = (state: IStore, ownProps) => {
  return {
    ...ownProps,
    factionName: selectors.getFactionName(state),
    hasSelections: selectors.hasSelections(state),
  }
}

const mapDispatchToProps = {
  resetAllySelections: selections.actions.resetAllySelections,
  resetRealmscapeStore: realmscape.actions.resetRealmscapeStore,
  resetSelections: selections.actions.resetSelections,
  setFactionName: factionNames.actions.setFactionName,
}

const Jumbotron = connect(mapStateToProps, mapDispatchToProps)(componentWithSize(JumbotronComponent))
