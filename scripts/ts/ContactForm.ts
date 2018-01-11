/**
 * Created by cesarmejia on 20/08/2017.
 */
module pl {

    export class ContactForm {

        // region Fields

        /**
         * Disable mode.
         * @type {boolean}
         */
        private _disabled: boolean;

        /**
         * Determine if window could close or not.
         * @type {boolean}
         */
        private _letCloseWindow: boolean = true;

        /**
         * Object that will be used to make requests.
         * @type {XMLHttpRequest}
         */
        private _req: XMLHttpRequest = new XMLHttpRequest;

        /**
         * Contains info for contact form.
         * @type {object}
         */
        private _settings: Object = {};

        // endregion

        /**
         * Create a contact form instance.
         * @param {HTMLElement} form
         * @param {object} settings
         */
        constructor(form: HTMLFormElement, settings: Object = {}) {
            if (!(form instanceof HTMLElement))
                throw 'Template is not an HTMLFormElement';

            let defaults = {
                url    : 'process-ajax.php',
                useAjax: true
            };

            this._form = form;
            this._settings = Util.extendsDefaults(defaults, settings);

            this.initializeEvents();
        }

        // region Private Methods

        /**
         * Make an ajax request with contact form data.
         * @param {object} data
         */
        private ajaxRequest(data) {
            let async = true;
            let method = 'POST';
            let settings = this._settings;
            let dataString = `data=${JSON.stringify(data)}`;

            this.onSending();

            this._req.open(method, settings['url'], async);
            this._req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            this._req.send(dataString);

        }

        /**
         * Shows message while contact form is working
         * and avoid user closes the window.
         */
        private beforeUnload() {
            if (!this._letCloseWindow) {
                return 'Sending message';
            }
        }

        /**
         * Handle input change event.
         * @param {Event} ev
         */
        private changed(ev) {
            let code = ev.which || ev.keyCode || 0;

            console.log('changed..');

            // Do nothing if key is invalid.
            if (this.isInvalidKey(code)) return;

            // Retrieve input and some attrs.
            let input: HTMLInputElement = ev.target;

            // Show or hide error.
            this.toggleInputError(input);
        }

        /**
         * Disable or enable form.
         */
        private disableForm() {
            if (this._disabled)
                Util.addClass(this.form, 'disabled');
            else
                Util.removeClass(this.form, 'disabled');

            [].forEach.call(this.inputs, input => {
                input.disabled = this._disabled;
            });
        }

        /**
         * Handles state changes of request.
         * @param {Event} ev
         */
        private handleReadyStateChange(ev) {
            let DONE = 4; // readyState 4 means the request is done.
            let OK   = 200; // status 200 is a successful return.

            if (this._req.readyState === DONE) {
                if (this._req.status === OK) {
                    this.onSuccess(
                        this._req.responseText,
                        this._req.status,
                        this._req.statusText
                    );
                } else {
                    this.onError(
                        this._req.status,
                        this._req.statusText
                    );
                }
            }
        }

        /**
         * Attach handlers to contact form elements.
         */
        private initializeEvents() {
            this.beforeUnload = this.beforeUnload.bind(this);
            this.changed      = this.changed.bind(this);
            this.submit       = this.submit.bind(this);
            this.handleReadyStateChange = this.handleReadyStateChange.bind(this);


            // Attach changed handler to each input in form.
            [].forEach.call(this.inputs, (input) => {
                if (input.type === 'text' || input.tagName.toLowerCase() === 'textarea')
                    input.addEventListener('keyup', this.changed, false);

                input.addEventListener('change', this.changed, false);
            });


            // Attach on submit handler to form.
            this.form.addEventListener('submit', this.submit, false);

            // Attach onbeforeunload handler.
            window.onbeforeunload = this.beforeUnload;

            // Attach handler to state change of request.
            this._req.onreadystatechange = this.handleReadyStateChange;

        }

        /**
         * Check validity of an input.
         * @param {HTMLInputElement} input
         * @returns {boolean} validity
         */
        private isInputValid(input: HTMLInputElement) {
            if ("string" === typeof input.dataset['validate']) {
                // Validation rules could be in this form "notEmpty|count:3"
                let rules: Array<string> = (<string>input.dataset['validate']).split('|'),
                    name: string = input.name,
                    value: string = input.value,
                    type: string = input.type,
                    valid: boolean = false;

                // region Validate checkbox input.
                if (type === "checkbox") {


                }
                // endregion

                // region Validate radio input.
                else if (type === "radio") {

                }
                // endregion

                // region Validate select and text input.
                else {
                    for (let i = 0; i < rules.length; i++) {
                        let rule: string = rules[i],
                            args: string,
                            array: Array<string>;

                        try {
                            if (rules[i].indexOf(":") > -1) {
                                rule = rules[i].slice(0, rules[i].indexOf(":"));
                                args = rules[i].slice(rules[i].indexOf(":") + 1);

                                array = args.split(',');
                                array.unshift(value);

                            } else {
                                array = [value];

                            }

                            // Validate!!
                            valid = Validator[rule].apply(this, array);

                        } catch (e) {
                            "console" in window
                            && console.log("Unknown \"%s\" validation in \"%s\" input", rule, name);
                        }

                        if (!valid) { break; }
                    }
                }
                // endregion

                return valid;
            }

            return true;
        }

        /**
         * Return if code is an invalid key.
         * @param {number} code
         */
        private isInvalidKey(code: number) {
            let i, invalidKeys = [
                Key.ALT,
                Key.CAPS_LOCK,
                Key.CTRL,
                Key.DOWN_ARROW,
                Key.LEFT_ARROW,
                Key.RIGHT_ARROW,
                Key.SELECT,
                Key.SHIFT,
                Key.UP_ARROW,
                Key.TAB
            ];

            for (i = 0; i < invalidKeys.length; i++) {
                if (invalidKeys[i] === code)
                    return true;
            }

            return false;
        }

        /**
         * Add or remove error from input
         * @param {HTMLElement} input
         */
        private toggleInputError(input) {
            let type : String = input['type'];

            // Points to parent node.
            let inputParent: HTMLElement = input.parentNode;
            let hasInputContainer: boolean = Util.hasClass(inputParent, 'input-container');

            // If input has an error get it.
            let clueElem: HTMLElement = input['clue-elem'];
            let clueText: string = "";

            if (this.isInputValid(input)) {

                if (clueElem) {
                    // Disappears and remove error element from DOM.
                    clueElem.parentNode.removeChild(clueElem);

                    // Set as null clue elem.
                    input['clue-elem'] = null;
                }

                // Remove invalid class.
                Util.removeClass(input, 'invalid');

                // Unmark as invalid input parent if has class ".input-container"
                hasInputContainer && Util.removeClass(inputParent, 'invalid');

            } else {

                if (!clueElem) {
                    // Retrieve input clue.
                    clueText = input.dataset['clue'] || 'Inválido';

                    // Create clue element.
                    clueElem = document.createElement('span');
                    clueElem.innerText = clueText;

                    Util.addClass(clueElem, 'input-clue');

                    // Store clue element in input.
                    input['clue-elem'] = clueElem;

                    Util.insertBefore(clueElem, input);

                    // Notify that an input has a error.
                    this.onInputError(input, clueText);

                }

                // Set invalid class.
                Util.addClass(input, 'invalid');

                // Mark as invalid input parent if has class ".input-container"
                hasInputContainer && Util.addClass(inputParent, 'invalid');

            }
        }

        // endregion

        // region Methods

        /**
         * Gets all values of inputs in JSON format.
         * @returns {object}
         */
        getFormValues() {
            let data = { };

            [].forEach.call(this.inputs, (input) => {
                data[input.name] = input.value
            });

            return data;
        }

        /**
         * Validates all inputs in the form.
         * @returns {boolean}
         */
        isFormValid() {
            let valid = true;

            [].forEach.call(this.inputs, input => {
                this.toggleInputError(input);

                if (!this.isInputValid(input)) {
                    valid = false;
                }
            });

            return valid;
        }

        /**
         * Reset form inputs.
         */
        reset() {
            this.form.reset();
        }

        /**
         * Handle submit event.
         * @param {Event} ev
         */
        submit(ev) {

            // Validate form.
            if (this.isFormValid()) {

                // If we're using ajax make other validations. Else let the flow keeps going.
                if (this._settings['useAjax']) {

                    // If form is disabled, it's possible that contact form is sending a request.
                    if (this._disabled) return;

                    // Maybe submit is called manually and there is no ev.
                    ev && ev.preventDefault();

                    let data = {
                        host: location.hostname,
                        data: this.getFormValues()
                    };

                    this.ajaxRequest(data);

                }

            } else {
                // Maybe submit is called manually and there is no ev.
                ev && ev.preventDefault();
            }

        }

        // endregion

        // region Events

        /**
         * Fires when contact form request has an error.
         * @param {number} status
         * @param {string} statusText
         */
        private onError(status, statusText) {
            if (this._error) {
                this._error.fire(status, statusText);
            }

            this.disabled = false;
            this._letCloseWindow = true;
        }

        /**
         * Fires when an input has an error.
         * @param {HTMLInputElement} input
         * @param {string} clueText
         */
        private onInputError(input, clueText) {
            if (this._inputError) {
                this._inputError.fire(input, clueText);
            }
        }

        /**
         * Fires when contact form is sending.
         */
        private onSending() {
            if (this._sending) {
                this._sending.fire();
            }

            this.disabled = true;
            this._letCloseWindow = false;
        }

        /**
         * Fires when contact form request was success.
         * @param {string} response
         * @param {number} status
         * @param {string} statusText
         */
        private onSuccess(response, status, statusText) {
            if (this._success) {
                this._success.fire(response, status, statusText);
            }

            this.disabled = false;
            this._letCloseWindow = true;

            parseInt(response) === 1 && this.reset();
        }

        // endregion

        // region Properties

        /**
         * Error event.
         * @type {pl.Event}
         */
        private _error: Event;

        /**
         * Get error event.
         * @returns {pl.Event}
         */
        get error() {
            if (!this._error) {
                this._error = new Event();
            }

            return this._error;
        }

        /**
         * Input error event.
         * @type {pl.Event}
         */
        private _inputError: Event;

        /**
         * Get input error event.
         * @returns {pl.Event}
         */
        get inputError() {
            if (!this._inputError) {
                this._inputError = new Event();
            }

            return this._inputError;
        }

        /**
         * Sending event.
         * @type {pl.Event}
         */
        private _sending: Event;

        /**
         * Get sending event
         * @returns {pl.Event}
         */
        get sending() {
            if (!this._sending) {
                this._sending = new Event();
            }

            return this._sending;
        }

        /**
         * Success event.
         * @type {pl.Event}
         */
        private _success: Event;

        /**
         * Get success event.
         * @returns {pl.Event}
         */
        get success() {
            if (!this._success) {
                this._success = new Event();
            }

            return this._success;
        }

        /**
         * Get disable mode.
         * @returns {boolean}
         */
        get disabled() {
            return this._disabled;
        }

        /**
         * Set disable mode.
         * @param {boolean} disabled
         */
        set disabled(disabled) {
            if (disabled !== this._disabled) {
                this._disabled = disabled;
                this.disableForm();
            }
        }

        /**
         * Points to form element.
         * @type {HTMLFormElement}
         */
        private _form: HTMLFormElement;

        /**
         * Get form element.
         * @returns {HTMLFormElement}
         */
        get form(): HTMLFormElement {
            return this._form;
        }

        /**
         * Point to all form inputs.
         * @type {NodeListOf<Element>}
         */
        private _inputs: NodeListOf<Element>;

        /**
         * Get form inputs.
         * @returns {NodeListOf<Element>}
         */
        get inputs() {
            if (!this._inputs) {
                let validInputs = [
                    "input[type=text]",
                    "input[type=checkbox]",
                    "input[type=radio]",
                    "select",
                    "textarea"
                ];

                this._inputs = this._form.querySelectorAll( validInputs.join(",") );
            }

            return this._inputs;
        }

        // endregion

    }

}