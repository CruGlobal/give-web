import angular from 'angular'
import transform from 'lodash/transform'
import sortBy from 'lodash/sortBy'

const controllerName = 'personalOptionsCtrl'

class ModalInstanceCtrl {
  /* @ngInject */
  constructor (designationNumber, giveDomain, givingLinks) {
    this.designationNumber = designationNumber
    this.giveDomain = giveDomain

    this.givingLinks = transform(givingLinks, (result, value, key) => {
      if (key === 'jcr:primaryType') { return }
      result.push({
        name: value.name,
        url: value.url,
        order: Number(key)
      })
    }, [])
    this.givingLinks = sortBy(this.givingLinks, 'order')
  }

  transformGivingLinks () {
    return transform(this.givingLinks, (result, value, i) => {
      delete value.order
      result[i + 1] = value
    }, {})
  }
}

export default angular
  .module(controllerName, [])
  .controller(controllerName, ModalInstanceCtrl)
