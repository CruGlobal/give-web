import angular from 'angular'


// --------------------------------------
// Okta SignIn Help functions
// --------------------------------------
// - showVerificationCodeField()
// - injectBackButton()
// - initializeFloatingLabels()


export function showVerificationCodeField() {
  // The verification code field is only shown when the button link "Enter a verification code instead" is clicked.
  // This makes the process of creating an account more streamlined as we remove that click.
  const verificationCodeButtonLink = document.querySelector('.button-link.enter-auth-code-instead-link');
  verificationCodeButtonLink?.click();
}

export function injectBackButton ({
  $scope,
  functionCallback,
  backButtonId,
  backButtonText
}) {
  const buttonBar = document.querySelector('.o-form-button-bar')
  // Ensure the button is only added once
  if (buttonBar && !buttonBar.querySelector(`#${backButtonId}`)) {
    const backButton = angular.element(`<button id="${backButtonId}" class="btn btn-secondary" type="button">${backButtonText}</button>`)
    // Add click behavior to go back a step
    backButton.on('click', (e) => {
      e.preventDefault()
      $scope.$apply(() => functionCallback())
    })
    // Prepend the Back button before the "Next" button
    angular.element(buttonBar).prepend(backButton)
  }
}

export function initializeFloatingLabels (floatingLabelAbortControllers = []) {
  // As the Label and Input fields are not directly related in the DOM, we need to manually
  // add the active class to the label when the input is focused or has a value.

  // Remove any existing listeners before adding new ones
  floatingLabelAbortControllers.forEach(controller => controller.abort())
  floatingLabelAbortControllers = []

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
    floatingLabelAbortControllers.push(controller)

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

