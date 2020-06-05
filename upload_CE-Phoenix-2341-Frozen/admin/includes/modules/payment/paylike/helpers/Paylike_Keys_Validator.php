<?php
/* Security class check */
if (! class_exists('PaylikeValidator')) :
    /**
     * Helper class that validates module keys via Paylike API
     */
    class PaylikeValidator
    {
        public $validationPublicKeys = array('Live'=>array(),'Test'=>array());
        /**
         * Validate the App key.
         *
         * @param string $value - the value of the input.
         * @param string $mode - the transaction mode 'test' | 'live'.
         *
         * @return string - the error message
         */
        public function validateAppKeyField($value, $mode)
        {
            /** Check if the key value is empty **/
            if (! $value) {
                return sprintf(ERROR_APP_KEY, $mode);
            }
            /** Load the client from API**/
            $paylikeClient = new \Paylike\Paylike($value);
            try {
                /** Load the identity from API**/
                $identity = $paylikeClient->apps()->fetch();
            } catch (\Paylike\Exception\ApiException $exception) {
                $this->logMessage(sprintf(ERROR_APP_KEY_INVALID, $mode));
                return sprintf(ERROR_APP_KEY_INVALID, $mode);
            }

            try {
                /** Load the merchants public keys list corresponding for current identity **/
                $merchants = $paylikeClient->merchants()->find($identity['id']);
                if ($merchants) {
                    foreach ($merchants as $merchant) {
                        /** Check if the key mode is the same as the transaction mode **/
                        if (($mode == 'Test' && $merchant['test']) || ($mode != 'Test' && !$merchant['test'])) {
                            $this->validationPublicKeys[$mode][] = $merchant['key'];
                        }
                    }
                }
            } catch (\Paylike\Exception\ApiException $exception) {
                $this->logMessage(sprintf(ERROR_APP_KEY_INVALID, $mode));
            }
            /** Check if public keys array for the current mode is populated **/
            if (empty($this->validationPublicKeys[$mode])) {
                /** Generate the error based on the current mode **/
                $error = sprintf(ERROR_APP_KEY_INVALID_MODE, $mode, array_values(array_diff(array_keys($this->validationPublicKeys), array($mode)))[0]);
                $this->logMessage($error);
                return $error;
            }
        }

        /**
         * Validate the Public key.
         *
         * @param string $value - the value of the input.
         * @param string $mode - the transaction mode 'test' | 'live'.
         *
         * @return string - the error message
         */
        public function validatePublicKeyField($value, $mode)
        {
            /** Check if the key value is not empty **/
            if (! $value) {
                return sprintf(ERROR_PUBLIC_KEY, $mode);
            }
            /** Check if the local stored public keys array is empty OR the key is not in public keys list **/
            if (empty($this->validationPublicKeys[$mode]) || ! in_array($value, $this->validationPublicKeys[$mode])) {
                $error = sprintf(ERROR_PUBLIC_KEY_INVALID, $mode);
                $this->logMessage($error);
                return $error;
            }
        }

        /**
         * log message to default logger
         *
         * @param string $message
         *
         */
        public static function logMessage($message)
        {
            error_log('[Paylike] ' . $message);
        }
    }
endif; /* End if class_exists. */
