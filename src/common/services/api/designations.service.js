import angular from 'angular'
import map from 'lodash/map'
import toFinite from 'lodash/toFinite'
import startsWith from 'lodash/startsWith'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'
import moment from 'moment'

import cortexApiService from '../cortexApi.service'
import hateoasHelperService from '../hateoasHelper.service'

const serviceName = 'designationsService'

class DesignationsService {
  /* @ngInject */
  constructor ($http, $location, envService, cortexApiService, hateoasHelperService) {
    this.$http = $http
    this.$location = $location
    this.envService = envService
    this.cortexApiService = cortexApiService
    this.hateoasHelperService = hateoasHelperService
  }

  productSearch (params) {
    const ministryIds = {
      '1-TF-1': 'Cru',
      '1-TG-1': 'Athletes In Action',
      '1-TG-2': 'World Priorities',
      '1-TG-3': 'Global Ministries',
      '1-TG-4': 'Global Media',
      '1-TG-5': 'World Headquarters at Lake Hart',
      '1-TG-6': 'JESUS Film Project',
      '1-TG-7': 'Josh McDowell Ministry',
      '1-TG-8': 'Keynote',
      '1-TG-9': 'Global',
      '1-TG-10': 'President\'s Office',
      '1-TG-11': 'Staff Giving',
      '1-TG-12': 'StoryRunners',
      '1-TG-13': 'Worldwide Challenge',
      '1-TH-1': 'Campus Ministry',
      '1-TH-2': 'Donation Services',
      '1-TH-3': 'Faculty Commons',
      '1-TH-4': 'Cities in America',
      '1-TH-5': 'CityConnect',
      '1-TH-6': 'Christian Embassy - Washington, D.C.',
      '1-TH-7': 'Christian Embassy - New York',
      '1-TH-8': 'FamilyLife',
      '1-TH-9': 'Unto™',
      '1-TH-10': 'Gift and Estate Design',
      '1-TH-11': 'Global Executive Ministries',
      '1-TH-12': 'Cru Inner City',
      '1-TH-13': 'ISP',
      '1-TH-14': 'Andre Kole Ministries',
      '1-TH-15': 'Military Ministry',
      '1-TH-16': 'Missionary Kids',
      '1-TH-17': 'Ney Bailey',
      '1-TH-18': 'New Life Resources',
      '1-TH-19': 'Cru High School',
      '1-TH-20': 'Women\'s Ministry',
      '1-TH-21': 'Crossroads',
      '1-TI-1': 'Intl Leadership Foundation',
      '1-TI-2': 'Intl Leadership University',
      '1-TI-3': 'Africa, Central Asia and Middle East (AFRICAME)',
      '1-TI-4': 'Asia',
      '1-TI-5': 'Europe and Russia',
      '1-TI-6': 'Leader Led Movements',
      '1-TI-7': 'Memorials',
      '1-TI-8': 'Priority Associates',
      '1-TJ-1': 'Canada',
      '1-TJ-2': 'Compassionate Evangelism/Responding to Needs',
      '1-TJ-3': 'North Africa / Middle East',
      '1-TJ-4': 'Australia, New Zealand, Pacific (Oceania)',
      '1-TJ-5': 'Pakistan, Central Asia, Turkey',
      '1-TJ-6': 'Central America, South America, Caribbean',
      '1-TJ-7': 'International Ministries',
      '1-TJ-9': 'The King\'s College',
      '1-TJ-10': 'U.S. Ministries',
      '1-TK-1': 'Global Regions',
      '1-TK-2': 'Macedonia Project',
      '1-TX-1': 'Bridges',
      '1-102-1': 'Misc Ministries',
      '1-103-1': 'U.S. Ministries',
      '1-108-1': 'East / Southern Africa',
      '1-108-2': 'Francophone Africa',
      '1-108-3': 'West Africa'
    }

    params = angular.copy(params)
    if (params.type !== 'people') {
      delete params.first_name
      delete params.last_name
    }

    return Observable.from(this.$http({
      method: 'get',
      url: this.envService.read('apiUrl') + '/search',
      params: params,
      cache: true
    })).map((response) => {
      return map(response.data.hits, (hit) => {
        const code = hit.id ? hit.id.split('/').pop().replace('.html', '') : ''
        return {
          path: hit.path || null,
          designationNumber: hit.designation_number || null,
          campaignPage: code !== hit.designation_number ? code : null,
          replacementDesignationNumber: hit.replacement_designation_number || null,
          name: hit.title || hit.description || null,
          type: hit.designation_type || null,
          facet: hit.facet || null,
          startMonth: hit.start_date ? moment(hit.start_date).format('YYYY-MM-01') : null,
          ministry: hit.organization_id ? ministryIds[hit.organization_id] : null,
          orgId: hit.organization_id ? hit.organization_id : 'cru'
        }
      })
    })
  }

  productLookup (query, selectQuery) {
    const zoomObj = {
      code: 'code',
      offer: 'offer:code',
      definition: 'definition',
      choices: 'definition:options:element:selector:choice[],definition:options:element:selector:choice:description,definition:options:element:selector:choice:selectaction',
      chosen: 'definition:options:element:selector:chosen,definition:options:element:selector:chosen:description'
    }

    const httpRequest = selectQuery
      ? this.cortexApiService.post({
          path: query,
          data: {},
          followLocation: true,
          zoom: zoomObj
        })
      : this.cortexApiService.post({
        path: ['items', this.cortexApiService.scope, 'lookups/form'],
        followLocation: true,
        data: {
          code: query
        },
        zoom: zoomObj
      })

    return httpRequest.map(data => {
      if (!data.code) throw new Error('Product lookup response contains no code data')
      if (!data.offer) throw new Error('Product lookup response contains no offer data')
      if (!data.definition) throw new Error('Product lookup response contains no definition data')
      if (!data.choices) throw new Error('Product lookup response contains no choices data')
      if (!data.chosen) throw new Error('Product lookup response contains no chosen data')
      const choices = map(data.choices.concat(data.chosen), choice => {
        return {
          name: choice.description.name,
          display: choice.description['display-name'],
          selectAction: choice.selectaction && choice.selectaction.self.uri || '' /* eslint-disable-line no-mixed-operators */
        }
      })

      let designationType
      let orgId
      angular.forEach(data.definition.details, (v, k) => {
        if (v.name === 'designation_type') {
          designationType = v['display-value']
        }
        if (v.name === 'org_id') {
          orgId = v['display-value']
        }
      })

      return {
        uri: this.hateoasHelperService.getLink(data.rawData, 'addtocartform'),
        frequencies: choices,
        frequency: data.chosen.description.name,
        displayName: data.definition['display-name'],
        designationType: designationType,
        code: data.code.code,
        designationNumber: data.offer.code,
        orgId: orgId
      }
    })
  }

  bulkLookup (designationNumbers) {
    return this.cortexApiService.post({
      path: ['items', this.cortexApiService.scope, 'lookups', 'batches', 'form'],
      data: {
        codes: designationNumbers
      },
      followLocation: true
    })
  }

  generatePath (code, campaignPage) {
    const c = code
      .split('')
      .slice(0, 5)
      .join('/')

    const [designationNumber] = code.split('_')

    return campaignPage
      ? `/content/give/us/en/campaigns/${c}/${designationNumber}/${campaignPage}.infinity.json`
      : `/content/give/us/en/designations/${c}/${designationNumber}.infinity.json`
  }

  suggestedAmounts (code, itemConfig) {
    const path = this.generatePath(code, itemConfig['campaign-page'])
    return Observable.from(this.$http.get(this.envService.read('publicGive') + path))
      .map((data) => {
        const suggestedAmounts = []
        if (data.data['jcr:content']) {
          // Map suggested amounts
          if (data.data['jcr:content'].suggestedAmounts) {
            angular.forEach(data.data['jcr:content'].suggestedAmounts, (v, k) => {
              if (toFinite(k) > 0 || k.includes('item')) {
                suggestedAmounts.push({
                  amount: toFinite(v.amount),
                  label: v.description,
                  order: toFinite(k) > 0 ? toFinite(k) : Number(k.substring(4))
                })
              }
            })
          }

          // Copy default-campaign-code to config
          if (data.data['jcr:content'].defaultCampaign && !itemConfig.CAMPAIGN_CODE) {
            itemConfig['default-campaign-code'] = data.data['jcr:content'].defaultCampaign
          }
          // Copy jcr:title
          if (data.data['jcr:content']['jcr:title']) {
            itemConfig['jcr-title'] = data.data['jcr:content']['jcr:title']
          }
        }
        return suggestedAmounts
      })
      .catch(() => Observable.of([]))
  }

  facebookPixel (code) {
    return Observable.from(this.designationData(code))
      .map(data => {
        return data.facebookPixelId
      })
  }

  designationData (code) {
    const path = this.generatePath(code)
    return Observable.from(this.$http.get(this.envService.read('publicGive') + path))
      .map((data) => {
        return data.data['jcr:content']
      })
  }

  givingLinks (code, campaignPage) {
    const path = this.generatePath(code, campaignPage)
    return Observable.from(this.$http.get(this.envService.read('publicGive') + path))
      .map((data) => {
        const givingLinks = []
        if (data.data['jcr:content']) {
          // Map giving links
          if (data.data['jcr:content'].givingLinks) {
            angular.forEach(data.data['jcr:content'].givingLinks, (v, k) => {
              if (!v || !v.name || !v.url) {
                return
              }

              if (toFinite(k) > 0 || startsWith(k, 'item')) {
                givingLinks.push({
                  name: v.name,
                  url: v.url,
                  order: toFinite(k) > 0 ? toFinite(k) : Number(k.substring(4))
                })
              }
            })
          }
        }
        return givingLinks
      })
  }

  ministriesList (pagePath) {
    const path = pagePath + '/jcr:content/content-parsys/designation_search_r.json'
    const url = `${this.$location.protocol()}://${this.$location.host()}/${path}`
    return Observable.from(this.$http.get(url))
      .map((response) => {
        return map(response.data.ministries, (item) => {
          const ministry = JSON.parse(item)
          return {
            name: ministry.name || null,
            designationNumber: ministry.designationNumber || null,
            path: ministry.path || null,
            facet: ministry.facet || null
          }
        })
      })
  }
}

export default angular
  .module(serviceName, [
    cortexApiService.name,
    hateoasHelperService.name
  ])
  .service(serviceName, DesignationsService)
