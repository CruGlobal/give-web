export class OktaAuth {
  constructor () {
    this.succeed = false
    this.loginRedirect = false
    this.authenticated = false

    this.token = {
      parseFromUrl: jest.fn(),
      getWithRedirect: jest.fn()
    }

    this.token.parseFromUrl.mockImplementation(() => {
      if (this.succeed) {
        return Promise.resolve({
          tokens: { accessToken: 'wee' }
        })
      } else {
        return Promise.reject(new Error('Something went wrong'))
      }
    })
    this.token.getWithRedirect.mockImplementation(() => Promise.resolve())

    this.tokenManager = {
      setTokens: () => {},
      getTokens: () => {
        if (this.authenticated && this.succeed) {
          return Promise.resolve({
            accessToken: {
              accessToken: 'wee'
            }
          })
        } else if (!this.succeed) {
          return Promise.reject(new Error('Something went wrong'))
        }
      }
    }
  }

  isLoginRedirect () {
    return this.loginRedirect
  }

  isAuthenticated () {
    return Promise.resolve(this.authenticated)
  }

  signOut () {
    // Do nothing
  }

  shouldSucceed () {
    this.succeed = true
  }

  shouldFail () {
    this.succeed = false
  }

  setupForRedirect () {
    this.loginRedirect = true
    this.setAuthenticated(true)
  }

  setAuthenticated (authenticated) {
    this.authenticated = authenticated
  }

  setLoginRedirect (loginRedirect) {
    this.loginRedirect = loginRedirect
  }
}
