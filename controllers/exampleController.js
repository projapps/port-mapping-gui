"use strict";
let cy;
let pc = new Map();
for (let i = 1; i <= 4; i++) {
    pc.set('s' + i + '-01', '#8B0000');
    pc.set('s' + i + '-02', '#B22222');
    pc.set('s' + i + '-03', '#FF0000');
    pc.set('s' + i + '-04', '#FF7F50');
    pc.set('s' + i + '-05', '#F08080');
    pc.set('s' + i + '-06', '#FA8072');
    pc.set('s' + i + '-07', '#FF4500');
    pc.set('s' + i + '-08', '#FFA500');
    pc.set('s' + i + '-09', '#B8860B');
    pc.set('s' + i + '-10', '#EEE8AA');
    pc.set('s' + i + '-11', '#FFFF00');
    pc.set('s' + i + '-12', '#556B2F');
    pc.set('s' + i + '-13', '#ADFF2F');
    pc.set('s' + i + '-14', '#008000');
    pc.set('s' + i + '-15', '#00FF00');
    pc.set('s' + i + '-16', '#90EE90');
    pc.set('s' + i + '-17', '#8FBC8F');
    pc.set('s' + i + '-18', '#00FF7F');
    pc.set('s' + i + '-19', '#66CDAA');
    pc.set('s' + i + '-20', '#20B2AA');
    pc.set('s' + i + '-21', '#008080');
    pc.set('s' + i + '-22', '#00FFFF');
    pc.set('s' + i + '-23', '#40E0D0');
    pc.set('s' + i + '-24', '#4682B4');
    pc.set('s' + i + '-25', '#00BFFF');
    pc.set('s' + i + '-26', '#ADD8E6');
    pc.set('s' + i + '-27', '#87CEFA');
    pc.set('s' + i + '-28', '#000080');
    pc.set('s' + i + '-29', '#0000CD');
    pc.set('s' + i + '-30', '#0000FF');
    pc.set('s' + i + '-31', '#4169E1');
    pc.set('s' + i + '-32', '#4B0082');
    pc.set('s' + i + '-33', '#6A5ACD');
    pc.set('s' + i + '-34', '#9370DB');
    pc.set('s' + i + '-35', '#9400D3');
    pc.set('s' + i + '-36', '#BA55D3');
    pc.set('s' + i + '-37', '#D8BFD8');
    pc.set('s' + i + '-38', '#DA70D6');
    pc.set('s' + i + '-39', '#DB7093');
    pc.set('s' + i + '-40', '#FF69B4');
    pc.set('s' + i + '-41', '#FFC0CB');
    pc.set('s' + i + '-42', '#FFEBCD');
    pc.set('s' + i + '-43', '#8B4513');
    pc.set('s' + i + '-44', '#D2691E');
    pc.set('s' + i + '-45', '#F4A460');
    pc.set('s' + i + '-46', '#D2B48C');
    pc.set('s' + i + '-47', '#708090');
    pc.set('s' + i + '-48', '#B0C4DE');
}

app.controller("exampleController", ['$scope', 'networkGraph', function($scope, networkGraph) {
    $scope.network = [
        { id: 's1', label: 'Switch 1', classes: 'switch' },
        { id: 's2', label: 'Switch 2', classes: 'switch' },
        { id: 's3', label: 'Switch 3', classes: 'switch' },
        { id: 's4', label: 'Switch 4', classes: 'switch' }
    ];

    networkGraph($scope.network).then(function(networkCy) {
        cy = networkCy;

        // use this variable to hide ui until cy loaded if you want
        $scope.cyLoaded = true;
    })
}]);

/**
 *  Cytoscape.js & Angular
 *  https://gist.github.com/maxkfranz/a1aea574f0e248b2b38e
 */
app.factory('networkGraph', ['$q', function($q) {
    let cy;
    let networkGraph = function (devices) {
        let deferred = $q.defer();

        // put nodes model in cy.js
        let eles = [];
        for (let i = 0; i < devices.length; i++) {
            eles.push({
                group: 'nodes',
                data: {
                    id: devices[i].id,
                    label: devices[i].label
                },
                classes: devices[i].classes
            });
        }

        // on dom ready
        $(function () {
            cy = cytoscape({
                container: $('#cy')[0],
                elements: eles,
                style: [
                    {
                        selector: 'node',
                        style: {
                            'label': 'data(label)',
                            'text-valign': 'bottom',
                            'text-halign': 'center'
                        }
                    },
                    {
                        selector: '.switch',
                        style: {
                            'height': 30,
                            'width': 50,
                            'background-opacity': '0.0',
                            'background-fit': 'contain',
                            'background-image': 'images/switch.png'
                        }
                    }
                ],
                layout: {
                    name: 'cose',
                },
                boxSelectionEnabled: false,
                autounselectify: true,
                ready: function () {
                    deferred.resolve(this);
                }
            });
        });

        return deferred.promise;
    };

    return networkGraph;
}]);

app.directive('fileReader', function() {
    return {
        scope: {
            fileReader:"="
        },
        link: function(scope, element) {
            $(element).on('change', function(changeEvent) {
                let files = changeEvent.target.files;
                if (files.length) {
                    let r = new FileReader();

                    r.onload = function(e) {
                        let filedata = JSON.parse(e.target.result);
                        let dataset = [];
                        let edges = [];

                        for (let key of Object.keys(filedata)) {
                            let node = {
                                group: "nodes",
                                data: {
                                    id: key,
                                    label: filedata[key].label,
                                    classes: filedata[key].classes,
                                    toRemove: true
                                }
                            };
                            dataset.push(node);
                            let edge = {
                                group: "edges",
                                data: {
                                    id: filedata[key].targetPort,
                                    source: key,
                                    target: filedata[key].targetSwitch
                                }
                            };
                            dataset.push(edge);
                            edges.push(edge);
                        }

                        let dots = angular.element('.dot');
                        dots.removeAttr('style');
                        cy.remove('node[toRemove]');
                        cy.add(dataset);
                        let layout = cy.layout({ name : "cose" });
                        layout.run();

                        cy.batch(function() {
                            edges.forEach(function(e) {
                                cy.$('#' + e.data.id).style({ 'line-color': pc.get(e.data.id) });
                                let dot = angular.element('#' + e.data.id);
                                dot.css('background-color', pc.get(e.data.id));
                            });
                        });
                    };

                    r.readAsText(files[0]);
                }
            });
        }
    };
});