import { showVerificationCodeField, injectBackButton } from "./oktaSignInWidgetHelper";

describe('oktaSignInWidgetHelper', () => {
  describe('showVerificationCodeField()', () => {
    const handleClick = jest.fn();
    window.handleClick = handleClick;
    beforeEach(() => {
      handleClick.mockClear();
    })

    it('should call handleClick when button link is rendered', () => {
      document.body.innerHTML = `
        <div>
          <button class="button-link enter-auth-code-instead-link" onclick="handleClick()">
            Enter authentication code instead
          </button>
        </div>
      `;

      showVerificationCodeField()
      expect(handleClick).toHaveBeenCalled();
    });

    it("shouldn't call handleClick if button link is not rendered", () => {
      document.body.innerHTML = `
        <div>Something else</div>
      `;

      showVerificationCodeField()
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('injectBackButton', () => {
    const $scope = {
      $apply: (functionCallback) => {
        if (typeof functionCallback === 'function') {
          functionCallback();
        }
      }
    }
    const mockFunction = jest.fn()
    const backButtonId = 'backButtonId'
    const backButtonText = 'backButtonText'

    beforeEach(() => {
     document.body.innerHTML = `
        <div class="o-form-button-bar">
          <button class="button">
            Continue
          </button>
        </div>
      `;
    });

    it("should render the back button in the HTML", () => {
      injectBackButton({
      $scope,
      functionCallback: mockFunction,
      backButtonId,
      backButtonText
      });

      const backButton = document.querySelector(`#${backButtonId}`);
      expect(backButton).not.toBeNull();
      expect(backButton.textContent).toBe(backButtonText);
    });

    it("should not add the back button if it already exists", () => {
      // Add the back button manually
      document.querySelector('.o-form-button-bar').innerHTML = `
      <button id="${backButtonId}" class="btn btn-secondary" type="button">${backButtonText}</button>
      `;

      injectBackButton({
      $scope,
      functionCallback: mockFunction,
      backButtonId,
      backButtonText
      });

      const buttons = document.querySelectorAll(`#${backButtonId}`);
      expect(buttons.length).toBe(1); // Ensure only one button exists
    });

    it("should call the functionCallback when the back button is clicked", () => {
      injectBackButton({
      $scope,
      functionCallback: mockFunction,
      backButtonId,
      backButtonText
      });

      const backButton = document.querySelector(`#${backButtonId}`);
      backButton.click();

      expect(mockFunction).toHaveBeenCalled();
    });

    it("should not render the back button if the button bar is not present", () => {
      document.body.innerHTML = `
      <div>Something else</div>
      `;

      injectBackButton({
      $scope,
      functionCallback: mockFunction,
      backButtonId,
      backButtonText
      });

      const backButton = document.querySelector(`#${backButtonId}`);
      expect(backButton).toBeNull();
    });
  })
});
