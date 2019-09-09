import angular from 'angular'
import designationEditorService from 'common/services/api/designationEditor.service'
import loading from 'common/components/loading/loading.component'
import addressForm from 'common/components/addressForm/addressForm.component'
import forEach from 'lodash/forEach'

import './newsletterModal.scss'

const controllerName = 'newsletterModal'

const addressPropertyMap = {
  country: 'country',
  streetAddress: 'street',
  extendedAddress: 'street2',
  intAddressLine3: 'street3',
  intAddressLine4: 'street4',
  locality: 'city',
  postalCode: 'postal_code',
  region: 'state'
}

class NewsletterModalController {
  /* @ngInject */
  constructor (designationEditorService, designationNumber, displayName) {
    this.designationEditorService = designationEditorService
    this.designationNumber = designationNumber
    this.displayName = displayName

    this.step = 1
    this.attributes = {
      send_newsletter: 'Email'
    }
    this.address = {
      country: 'US'
    }
  }

  next () {
    if (this.step === 2) {
      this.progress = true

      // Map address properties to attributes properties
      forEach(this.address, (value, key) => {
        this.attributes[addressPropertyMap[key]] = value
      })

      this.designationEditorService.subscribeToNewsletter(this.designationNumber, this.attributes).then(() => {
        this.success = true
      }, error => {
        this.error = error
        // Remove attributes keys on error, they will be rewritten on subsequent submits.
        forEach(addressPropertyMap, (value) => {
          delete this.attributes[value]
        })
      }).finally(() => {
        this.step = 3
        this.progress = false
      })
    } else {
      this.step++
    }
  }

  prev () {
    this.step--
    this.error = false
  }

  get includeEmailField () {
    return ['Email', 'Both'].includes(this.attributes.send_newsletter)
  }

  get includeAddressFields () {
    return ['Physical', 'Both'].includes(this.attributes.send_newsletter)
  }
}

export default angular
  .module(controllerName, [
    designationEditorService.name,
    loading.name,
    addressForm.name
  ])
  .controller(controllerName, NewsletterModalController)
