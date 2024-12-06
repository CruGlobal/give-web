export function initializeRecaptcha () {
  const script = this.$window.document.createElement('script')
  script.src = `https://www.google.com/recaptcha/enterprise.js?render=${this.envService.read('recaptchaKey')}`
  script.id = 'give-checkout-recaptcha'
  if (!this.$window.document.getElementById(script.id)) {
    this.$window.document.head.appendChild(script)
  }
}
