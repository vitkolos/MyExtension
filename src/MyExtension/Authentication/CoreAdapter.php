<?php
namespace Rubedo\User\Authentication\Adapter;
use Rubedo\Exceptions\Server;
use Rubedo\Services\Manager;
use WebTales\MongoFilters\Filter;
use Zend\Authentication\Result;
class CoreAdapterCcn extends AbstractAdapter
{
    /**
     * submited password
     *
     * @var string
     */
    private $_password = null;
    /**
     * submited login
     *
     * @var string
     */
    private $_login = null;
    /**
     * $_authenticateResultInfo
     *
     * @var array
     */
    protected $_authenticateResultInfo = null;
    /**
     * Performs an authentication attempt
     *
     * @throws Zend_Auth_Adapter_Exception If authentication cannot be performed
     * @return Zend_Auth_Result
     */
    public function authenticate()
    {
        $dataService = Manager::getService('MongoDataAccess');
        $dataService->init('Users');
        $dataService->addToFieldList(array(
            'login',
            'password',
            'salt',
            'startValidity',
            'endValidity',
            'status'
        ));
        $hashService = Manager::getService('Hash');
        $loginCond = Filter::factory('Or');
        $loginFilter = Filter::factory('Value')->setName('login')->setValue(new \MongoRegex("/^".$this->_login."$/i"));
        $loginCond->addFilter($loginFilter);
        $emailFilter = Filter::factory('Value')->setName('email')->setValue($this->_login);
        $loginCond->addFilter($emailFilter);
        $dataService->addFilter($loginCond);
        $resultIdentitiesArray = $dataService->read();
        $resultIdentities = $resultIdentitiesArray['data'];
        if (count($resultIdentities) < 1) {
            $this->_authenticateResultInfo['code'] = Result::FAILURE_IDENTITY_NOT_FOUND;
            $this->_authenticateResultInfo['messages'][] = 'A record with the supplied identity could not be found.';
            return $this->_authenticateCreateAuthResult();
        } elseif (count($resultIdentities) > 1) {
            $this->_authenticateResultInfo['code'] = Result::FAILURE_IDENTITY_AMBIGUOUS;
            $this->_authenticateResultInfo['messages'][] = 'More than one record matches the supplied identity.';
            return $this->_authenticateCreateAuthResult();
        }
        $user = array_shift($resultIdentities);
        //DO LDAP CONNECTION ONLY ON HTTPS WEBSITE
        $isSecured = isset($_SERVER['HTTPS']) ? true :false;
        $valid = false;
        if($isSecured) {
            /////CHECK IN LDAP
            // prepare request
            $payload = array(
                            "login" => $user['login'],
                            "passwd" =>$this->_password
            );
            //get LDAP infos
            $this->_dataService = Manager::getService('MongoDataAccess');
            $this->_dataService->init("Contents");
            $content = $this->_dataService->findById("58335667245640064b8b9093");
            if (empty($content)) {
                            throw new APIEntityException('Content not found', 404);
            }
            $payload['extpass'] = $content['live']['fields']['value'];
            $postURL = $content['live']['fields']['value2'];
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, $postURL);
            curl_setopt($curl, CURLOPT_POST, 1);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $payload);
            curl_setopt($curl, CURLOPT_HTTPHEADER, array('Expect:'));
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); // On dev server only!
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);  // Follow the redirects (needed for mod_rewrite)
            $result = curl_exec($curl);
            curl_close($curl);
            $isLDAPValid = explode(";",$result)[0];
            //$isLDAPValid = false;
            if($isLDAPValid && $isLDAPValid=="True") {
                // l'utilisateur existe et a le bon mot de passe => valider la connexion
                $valid = true;
                unset($user['password']);
            }
        }
        if(!$isSecured || ($isSecured && $isLDAPValid=="False")) {
            //site non HTTPS ou
            // utilisateur non identifié dans LDAP ou utilisateur LDAP avec mauvais mot de passe=> suivre l'identification habituelle dans RUBEDO
            // ainsi les mots de passe initialisés dans RUBEDO restent valides
            $salt = $user['salt'];
            $targetHash = $user['password'];
            unset($user['password']);
            $valid = $hashService->checkPassword($targetHash, $this->_password, $salt);
            $currentTime = Manager::getService('CurrentTime')->getCurrentTime();
            if ($valid && isset($user['startValidity']) && !empty($user['startValidity'])) {
                $valid = $valid && ($user['startValidity'] <= $currentTime);
                if (!$valid) {
                    $this->_authenticateResultInfo['messages'][] = 'User account is not yet active';
                }
            }
            if ($valid && isset($user['endValidity']) && !empty($user['endValidity'])) {
                $valid = $valid && ($user['endValidity'] > $currentTime);
                if (!$valid) {
                                $this->_authenticateResultInfo['messages'][] = 'User account is no longer active';
                }
            }
            if ($valid && isset($user['status']) && !empty($user['status'])) {
                $valid = $valid && ($user['status'] == "approved");
                if (!$valid) {
                                $this->_authenticateResultInfo['messages'][] = 'User account has not been activated';
                }
            }
        }
        
		
        if ($valid) {
            $this->_authenticateResultInfo['code'] = Result::SUCCESS;
            //$this->_authenticateResultInfo['messages'][] = $isLDAPValid;
												$this->_authenticateResultInfo['messages'][] = 'Authentication successful.';
            
												$this->_authenticateResultInfo['identity'] = $user;
            return $this->_authenticateCreateAuthResult();
        } else {
            $this->_authenticateResultInfo['code'] = Result::FAILURE_CREDENTIAL_INVALID;
            $this->_authenticateResultInfo['messages'][] = 'Supplied credential is invalid.';
            return $this->_authenticateCreateAuthResult();
        }
    }
    /**
     * Initialise class with login and password
     *
     * @param $name string login
     * @param $password string password
     * @throws \Rubedo\Exceptions\Server
     */
    public function __construct($name, $password)
    {
        if (!is_string($name)) {
            throw new Server('$name should be a string', "Exception40", '$name');
        }
        if (!is_string($password)) {
            throw new Server('$password should be a string', "Exception40", '$password');
        }
        $this->_authenticateResultInfo['identity'] = null;
        $this->_login = $name;
        $this->_password = $password;
    }
    /**
     * _authenticateCreateAuthResult() - Creates a Zend_Auth_Result object from
     * the information that has been collected during the authenticate()
     * attempt.
     *
     * @return Zend_Auth_Result
     */
    protected function _authenticateCreateAuthResult()
    {
        return new Result($this->_authenticateResultInfo['code'], $this->_authenticateResultInfo['identity'], $this->_authenticateResultInfo['messages']);
    }
}
