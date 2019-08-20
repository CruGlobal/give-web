import angular from 'angular'
import designationEditorService from 'common/services/api/designationEditor.service'
import loading from 'common/components/loading/loading.component'

import './newsletterModal.scss'

const controllerName = 'newsletterModal'

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
  }

  next () {
    if (this.step === 2) {
      this.progress = true
      this.designationEditorService.subscribeToNewsletter(this.designationNumber, this.attributes).then(() => {
        // TODO: Handle success and failure
        // Success
        this.success = true
      }, error => {
        this.error = error
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
    loading.name
  ])
  .controller(controllerName, NewsletterModalController)
