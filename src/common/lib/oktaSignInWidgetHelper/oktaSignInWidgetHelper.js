import angular from 'angular'

// --------------------------------------
// Okta SignIn Help functions
// --------------------------------------
// - showVerificationCodeField()
// - injectBackButton()
// - initializeFloatingLabels()

export function showVerificationCodeField () {
  // The verification code field is only shown when the button link "Enter a verification code instead" is clicked.
  // This makes the process of creating an account more streamlined as we remove that click.
  const verificationCodeButtonLink = document.querySelector('.button-link.enter-auth-code-instead-link')
  verificationCodeButtonLink?.click()
}

export function injectBackButton (context) {
  // context will be the component instance that calls this function
  if (!context || !context.onBackButtonClick) {
    throw new Error('Context must be provided with a valid onBackButtonClick function.')
  }

  const backButtonId = 'backButton'
  const backButtonText = 'Back'
  const buttonBar = document.querySelector('.o-form-button-bar')
  // Ensure the button is only added once
  if (buttonBar && !buttonBar.querySelector(`#${backButtonId}`)) {
    const backButton = angular.element(`<button id="${backButtonId}" class="btn btn-secondary" type="button">${backButtonText}</button>`)
    backButton.on('click', (e) => {
      e.preventDefault()
      context.onBackButtonClick()
    })
    // Prepend the Back button before the "Next" button
    angular.element(buttonBar).prepend(backButton)
  }
}

export function initializeFloatingLabels (context) {
  // context will be the component instance that calls this function
  if (!context || !context.floatingLabelAbortControllers) {
    throw new Error('Context must be provided with a valid floatingLabelAbortControllers array variable.')
  }
  // Ensure floatingLabelAbortControllers is initialized
  if (!context.floatingLabelAbortControllers) {
    context.floatingLabelAbortControllers = []
  }

  // As the Label and Input fields are not directly related in the DOM, we need to manually
  // add the active class to the label when the input is focused or has a value.

  // Remove any existing listeners before adding new ones
  context.floatingLabelAbortControllers.forEach(controller => controller.abort())
  context.floatingLabelAbortControllers = []

  document.querySelectorAll('.o-form-content input[type="text"], .o-form-content input[type="password"]')?.forEach(input => {
    const label = input.labels[0]?.parentNode
    if (!label) {
      return
    }
    // if the input already has a value, mark the label as active
    if (input.value.trim() !== '') {
      label.classList.add('active')
    }
    // Create and save the controller so we can later remove the listeners.
    const controller = new AbortController()
    context.floatingLabelAbortControllers.push(controller)

    input.addEventListener('focus', () => {
      label.classList.add('active')
    }, { signal: controller.signal })
    input.addEventListener('blur', () => {
      // When the input loses focus, check its value.
      if (input.value.trim() === '') {
        label.classList.remove('active')
      }
    }, { signal: controller.signal })
  })
}
