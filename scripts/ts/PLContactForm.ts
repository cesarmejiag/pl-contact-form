/**
 * Created by cesarmejia on 20/08/2017.
 */
module pl {

    export class ContactForm {

        /**
         * Points to form element.
         * @type {HTMLFormElement}
         * @private
         */
        private _form: HTMLFormElement;

        /**
         * Store custom handlers for each event in ajax request.
         * @type {object}
         * @private
         */
        private _handlers: Object = {};

        /**
         * Points to form inputs.
         * @type {NodeListOf<Element>}
         * @private
         */
        private _inputs: NodeListOf<Element>;

        /**
         * Determine if window could close or not.
         * @type {boolean}
         * @private
         */
        private _letCloseWindow: boolean = true;

        /**
         * Check validity of an input.
         * @param {HTMLInputElement} input
         * @returns {boolean} validity
         */
        static isInputValid(input: HTMLInputElement) {
            let validation = input.dataset['validate'],
                name  = input.name,
                value = input.value;

            switch (validation) {
                case 'notEmpty':
                    return Validator.notEmpty(value);
                case 'phone':
                    return Validator.phone(value);
                case 'email':
                    return Validator.email(value);
                default:
                    "console" in window
                    && console.log("Unknown validation type: " + name);
                    return true;
            }
        }

        /**
         * Return if code is an invalid key.
         * @param {number} code
         */
        static isInvalidKey(code: number) {
            let i,
                invalidKeys = {
                    ALT_KEY        : 18,
                    CAPS_LOCK_KEY  : 20,
                    CTRL_KEY       : 17,
                    DOWN_ARROW_KEY : 40,
                    LEFT_ARROW_KEY : 37,
                    RIGHT_ARROW_KEY: 39,
                    SELECT_KEY     : 93,
                    SHIFT_KEY      : 16,
                    UP_ARROW_KEY   : 38
                };

            for (i in invalidKeys) {
                if (invalidKeys[i] === code)
                    return true;
            }

            return false;
        }

        /**
         * Get form inputs.
         * @param form
         * @returns {NodeListOf<Element>}
         */
        static getInputs(form: HTMLFormElement) {
            let validInputs = [
                "input[type=text]",
                "input[type=checkbox]",
                "input[type=radio]",
                "textarea"
            ];

            return form.querySelectorAll( validInputs.join(",") );
        }

        /**
         *
         * @param {HTMLElement} form
         */
        constructor(form: HTMLFormElement) {
            if (!(form instanceof HTMLElement))
                throw 'Template is not an HTMLElement';

            this._form = form;
            this._inputs = ContactForm.getInputs(this._form);

            this.beforeUnload = this.beforeUnload.bind(this);
            this.onInputChange = this.onInputChange.bind(this);
            this.onSubmit = this.onSubmit.bind(this);

            this.initializeEvents();
        }

        /**
         *
         */
        private ajaxRequest() {

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
         * Attach handlers to contact form elements.
         */
        private initializeEvents() {
            // Attach onInputChange handler to each input in form.
            [].forEach.call(this._inputs, (input) => {
                if (input.type === 'text' || input.tagName.toLowerCase() === 'textarea')
                    input.addEventListener('keyup', this.onInputChange, false);

                input.addEventListener('change', this.onInputChange, false);
            });


            // Attach on Submit handler to form.
            this._form.addEventListener('submit', this.onSubmit, false);

            // Attach onbeforeunload handler.
            window.onbeforeunload = this.beforeUnload;

        }

        /**
         * Handle input change event.
         * @param {Event} ev
         */
        private onInputChange(ev) {
            let input = ev.target;
            let code = ev.which || ev.keyCode || 0;

            // Do nothing if a key is invalid.
            if (ContactForm.isInvalidKey(code)) return;

            if (ContactForm.isInputValid(input)) {
                Util.removeClass(input, 'invalid');
            } else {
                Util.addClass(input, 'invalid');
            }
        }

        /**
         * Handle submit event.
         * @param {Event} ev
         */
        private onSubmit(ev) {
            ev.preventDefault();

            console.log('Form submitted');
        }

        /**
         * Add custom handler.
         * @param {string} name before|error|success
         * @param {function} handler
         */
        public addHandler(name, handler) {
            this._handlers[name] = handler;
        }

        /**
         * Reset form.
         */
        public reset() {
            this._form.reset();
        }

    }

}