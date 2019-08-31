import { IUser } from 'types/user'
import { ISavedArmy, ISavedArmyFromApi } from 'types/savedArmy'
import { PreferenceApi } from './preferenceApi'
import { SubscriptionApi } from './subscriptionApi'
import { ISubscription } from 'types/subscription'

// These aren't technically thunks - maybe one day :)

export const saveArmyToApi = async (
  user: IUser,
  savedArmy: ISavedArmy,
  createSavedArmy: (army: ISavedArmyFromApi) => void
) => {
  try {
    const payload = { userName: user.email, ...savedArmy }
    const res = await PreferenceApi.createSavedArmy(payload)
    const armyFromApi = res.body as ISavedArmyFromApi
    console.log(`created savedArmy named ${armyFromApi.armyName}, id: ${armyFromApi.id}`)
    createSavedArmy(armyFromApi)
  } catch (err) {
    console.error(err)
  }
}

export const loadSavedArmiesFromApi = async (
  user: IUser,
  loadSavedArmies: (savedArmies: ISavedArmyFromApi[]) => void
) => {
  try {
    const res = await PreferenceApi.getUserItems(user.email)
    const savedArmies = res.body as ISavedArmyFromApi[]
    console.log(`loaded ${savedArmies.length} saved armies`)
    console.log(savedArmies)
    loadSavedArmies(savedArmies)
  } catch (err) {
    console.log(err)
  }
}

export const deleteSavedArmyFromApi = async (
  army: ISavedArmyFromApi,
  deleteSavedArmy: (id: string, userName: string) => void
) => {
  try {
    const { id, userName } = army
    await PreferenceApi.deleteItem(id, userName)
    console.log(`deleted army id: ${id} for user ${userName}`)
    deleteSavedArmy(id, userName)
  } catch (err) {
    console.error(err)
  }
}

export const getSubscriptionFromApi = async (
  user: IUser,
  updateSubscription: (subscription: ISubscription) => void,
  resetSubscription: () => void
) => {
  if (!user) return resetSubscription()
  try {
    const response = await SubscriptionApi.getSubscription(user.email)
    const subscription: ISubscription = response.body
    updateSubscription(subscription)
  } catch (err) {
    console.error(err)
    resetSubscription()
  }
}