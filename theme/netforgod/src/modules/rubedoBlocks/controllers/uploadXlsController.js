angular.module("rubedoBlocks").lazy.controller('uploadXlsController',['$scope', '$http', 'RubedoPagesService', 'RubedoContentsService', 'RubedoOrdersService',
function($scope, $http, RubedoPagesService, RubedoContentsService, RubedoOrdersService){
    console.log("UploadXlsController")

    $scope.workbook = null;
    let me = this;
    $scope.logs = [];
    $scope.loading = false;

    $scope.current_o_pn = null;
    $scope.current_r_pn = null;
    $scope.loadPN = function() {
        console.log("loading PN")
        if ($scope.current_o_pn_id) {
            $scope.current_o_pn = $scope.onesime_pns.find(pn => pn['Code PN'] == $scope.current_pn_id);
            $scope.current_r_pn = $scope.rubedo_pns.find(pn => pn.fields.pointNetId == $scope.current_pn_id);
        }
    }

    $scope.uploadXLS = function() {
        let f = document.getElementById('file').files[0],
        r = new FileReader();

        r.onload = async function () {
            $scope.loading = true;
            window.result = r.result;
            let wb = XLSX.read(r.result, {type:"array"});
            window.workbook = wb;
            window.data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
            window.data.sort((a,b) => a['Code PN'] < b['Code PN'] ? -1 : 1);
            $scope.onesime_pns = window.data;

            // we get netforgod PN list
            window.rubedoContents = RubedoContentsService;
            await updatePNs($scope.onesime_pns);

            $scope.loading = false;
        }
        
        r.readAsArrayBuffer(f);
    }
    
    async function updatePNs(onesime_pns) {
        // the id below is the id of the Rubedo Query called "Points Net", it returns all Points Net in Rubedo
        let rubedo_pns = await RubedoContentsService.getContents("5dcdbf568e707529379d34b1",null,null,{limit:20000});
        window.rubedo_pns = rubedo_pns;
        if (rubedo_pns.status != 200) return log("error", rubedo_pns);
        if (!rubedo_pns.data.success) return log("error", rubedo_pns);
        rubedo_pns = rubedo_pns.data.contents;
        $scope.rubedo_pns = rubedo_pns;

        for (let i = 0; i < onesime_pns.length; i++) {
            let o_pn = onesime_pns[i];
            log('info', `updating PN ${o_pn['Code PN']}`);
            let r_pn = rubedo_pns.filter(pn => pn.fields.pointNetId == o_pn['Code PN']);
            if (r_pn.length == 0) {
                log('info', `PN ${o_pn['Code PN']} does not exist yet`);
            } else if (r_pn.length > 1) {
                log('warning', `There are ${r_pn.length} PN with the code ${o_pn['Code PN']}. All will be updated`);
            } else {
                r_pn = r_pn[0];
                //log('info', `${o_pn['Adr1'] + ' ' + o_pn['Adr2']} == ${r_pn.fields.position.address}<br>${o_pn['Mail 1']} == ${r_pn.fields.email}`);
            }

            //if (i> 4) return;
        }
    }

    function log(level, data) {
        level = level.toLowerCase();
        let data_s = (typeof data == 'string') ? data: JSON.stringify(data);
        $scope.logs.push({level, msg: data_s});
        if (level == "error" || level == "err") console.error(data);
        else if (level == "warning" || level == 'warn') console.warn(data);
        else console.log(data);
    }
}]);