angular.module("rubedoBlocks").lazy.controller("DonationController",['$scope','RubedoUserTypesService','RubedoUsersService','RubedoAuthService','RubedoMailingListService',
                                                                     function($scope,RubedoUserTypesService,RubedoUsersService,RubedoAuthService,RubedoMailingListService) {
    var me = this;
    var themePath='/theme/'+window.rubedoConfig.siteTheme;
    //templates
    me.donationTemplate = themePath+'/templates/blocks/donation.html';
    me.currentStage=1;
    me.userType="56e6edeac445eccc038b5b8e"; // type d'utilisateurs = donateurs
    $scope.don= {};
    $scope.don.user={};
    $scope.don.user.country = "FRANCE";

    me.toggleStage = function(newStage){
       angular.element("#inscriptionStage"+me.currentStage).collapse("hide");
       angular.element("#inscriptionStage"+newStage).collapse("show");
       me.currentStage = newStage;
    }
    me.setCurrentStage = function(step, valide) {
        if(valide){
            /*
            if (step==3) {
                    me.stage2Error=null;
                    if (!$scope.rubedo.current.user){
                        me.createUser();
                    } else {
                        me.persistUserChanges(me.stage2Error);
                    }

            }
            else */
            
            me.toggleStage(step);
        }  
    };
    me.parseUserType=function(userType){
        me.userType=userType;
        $scope.fieldIdPrefix="checkout"+"_"+me.userType.type;
        if (!$scope.rubedo.current.user){
            me.userType.fields.unshift({
                cType:"textfield",
                config:{
                    name:"confirmPassword",
                    fieldLabel:$scope.rubedo.translate("Blocks.SignUp.label.confirmPassword"),
                    allowBlank:false,
                    vtype:"password"
                }
            });
            me.userType.fields.unshift({
                cType:"textfield",
                config:{
                    name:"password",
                    fieldLabel:$scope.rubedo.translate("Blocks.SignUp.label.password"),
                    allowBlank:false,
                    vtype:"password"
                }
            });
        }
        me.userType.fields.unshift({
            cType:"textfield",
            config:{
                name:"email",
                fieldLabel:$scope.rubedo.translate("Label.Email"),
                allowBlank:false,
                vtype:"email"
            }
        });
        me.userType.fields.unshift({
            cType:"textfield",
            config:{
                name:"name",
                fieldLabel:$scope.rubedo.translate("Blocks.SignUp.label.name"),
                allowBlank:false
            }
        });
        me.inputFields=me.userType.fields;
    };
    me.initializeCheckout=function(){
        $scope.fieldIdPrefix="donation";

        $scope.fieldInputMode=true;
        if (!$scope.rubedo.current.user){
            if (me.userType){
                RubedoUserTypesService.getUserTypeById(me.userType).then(
                    function(response){
                        if (response.data.success){
                            me.parseUserType(response.data.userType);
                        }
                    }
                );
            }
        } else {
            RubedoUsersService.getUserById($scope.rubedo.current.user.id).then(
                function(response){
                    if (response.data.success){
                        me.currentUser=response.data.user;
                        var existingData=angular.copy(me.currentUser.fields);
                        $scope.don.user = angular.copy(me.currentUser.fields);
                        //me.parseUserType(me.currentUser.type);
                    }
                }
            );
        }
    };
    me.createUser=function(){
        if ($scope.don.user.confirmPassword!=$scope.don.user.password){
            me.stage2Error="Passwords do not match.";
            return;
        }
        var newUserFields=angular.copy($scope.don.user);
        delete (newUserFields.confirmPassword);
        newUserFields.login=newUserFields.email;

        RubedoUsersService.createUser(newUserFields,"56e6edeac445eccc038b5b8e").then(
            function(response){
                if (response.data.success){
                    RubedoAuthService.generateToken({login:newUserFields.login,password:newUserFields.password},me.rememberMe).then(
                        function(authResponse){
                            me.toggleStage(3);
                        }
                    );
                }
            },
            function(response){
                me.stage2Error=response.data.message;
            }
        );
    };    
    me.persistUserChanges=function(errorHolder,refreshShippers){
        var payload=angular.copy(me.currentUser);
        payload.fields=angular.copy($scope.don.user);
        delete (payload.type);
        RubedoUsersService.updateUser(payload).then(
            function(response){
                me.toggleStage(3);
            },
            function(response){
                me.errorHolder=response.data.message;
            }
        );
    };    
    
        me.initializeCheckout();

    
}]);


