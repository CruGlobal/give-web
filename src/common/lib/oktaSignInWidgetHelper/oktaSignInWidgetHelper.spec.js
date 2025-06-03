import { showVerificationCodeField, injectBackButton, initializeFloatingLabels, backButtonId, backButtonText } from "./oktaSignInWidgetHelper";

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
    const onBackButtonClickSpy = jest.fn()
    const thisComponent = {
      onBackButtonClick: onBackButtonClickSpy,
      $scope: {
        $apply: (functionCallback) => {
          if (typeof functionCallback === 'function') {
            functionCallback();
          }
        }
      }
    }
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
      injectBackButton(thisComponent);

      const backButton = document.querySelector(`#${backButtonId}`);
      expect(backButton).not.toBeNull();
      expect(backButton.textContent).toBe(backButtonText);
    });

    it("should not add the back button if it already exists", () => {
      // Add the back button manually
      document.querySelector('.o-form-button-bar').innerHTML = `
      <button id="${backButtonId}" class="btn btn-secondary" type="button">${backButtonText}</button>
      `;

      injectBackButton(thisComponent);

      const buttons = document.querySelectorAll(`#${backButtonId}`);
      expect(buttons.length).toBe(1); // Ensure only one button exists
    });

    it("should call the functionCallback when the back button is clicked", () => {
      injectBackButton(thisComponent);

      const backButton = document.querySelector(`#${backButtonId}`);
      backButton.click();

      expect(onBackButtonClickSpy).toHaveBeenCalled();
    });

    it("should not render the back button if the button bar is not present", () => {
      document.body.innerHTML = `
      <div>Something else</div>
      `;

      injectBackButton(thisComponent);

      const backButton = document.querySelector(`#${backButtonId}`);
      expect(backButton).toBeNull();
    });
  })

  describe('initializeFloatingLabels', () => {
    const thisComponent = {
      floatingLabelAbortControllers: []
    }
    beforeEach(() => {
      document.body.innerHTML = `
      <div class="o-form-content">
        <div class="label-holder">
          <label for="input58">First name</label>
        </div>
        <div class="input-holder">
          <input type="text" id="input58" />
        </div>
      </div>
      `;
    });
    
    it('should update floatingLabelAbortControllers variable', () => {
      expect(thisComponent.floatingLabelAbortControllers.length).toEqual(0);
      initializeFloatingLabels(thisComponent);
      expect(thisComponent.floatingLabelAbortControllers.length).toEqual(1);
    });


    it('should add the "active" class to the label when input is focused', () => {
      initializeFloatingLabels(thisComponent);

      const input = document.querySelector('#input58');
      const label = input.labels[0]?.parentNode;

      // Simulate focusing the input
      input.dispatchEvent(new Event('focus'));

      expect(label.classList.contains('active')).toBe(true);
    });
  });
});
