(function () {
  'use strict';

  angular
    .module('common.patient')
    .component('patientHeader', {
      controller: PatientHeaderController,
      controllerAs: 'vm',
      bindings: {
        patient: '<',
        displayActions: '<',
        alterPatient: '<',
        onPatientDeceased: '&'
      },
      templateUrl: '../common/patient/directives/patientHeader.html'
    });

  /* @ngInject */
  function PatientHeaderController($state, $filter, $uibModal, conceptService, notifier, patientService) {
    var vm = this;

    vm.linkPatientDetail = linkPatientDetail;
    vm.linkPatientEdit = linkPatientEdit;
    vm.linkSearch = linkSearch;
    vm.openPatientDeleteModal = openPatientDeleteModal;

    function linkPatientDetail() {
      $state.go('detailpatient', {
        patientUuid: vm.patient.uuid,
        returnState: $state.current
      });
    }


    function linkPatientEdit() {
      $state.go('editpatient', {
        patientUuid: vm.patient.uuid,
        returnState: $state.current
      });
    }

    function openPatientDeleteModal() {
      var modalInstance = $uibModal.open({
        component: 'patientDeleteModal',
        resolve: {
          patient: () => vm.patient
        }
      });

      modalInstance.result
        .then(deleteData => {
          if (deleteData.dead) {
            return deceasedPatient(deleteData.deathDate, deleteData.causeOfDeath);
          } else {
            return deletePatient(deleteData.deleteReason);
          }
        })
        .then(() => {
          notifier.success($filter('translate')('COMMON_MESSAGE_SUCCESS_ACTION_COMPLETED'));
        });
    }

    function deceasedPatient(date, causeOfDeath) {
      return patientService.updatePerson(vm.patient.uuid, {dead: true, deathDate: date, causeOfDeath: causeOfDeath})
        .then(() => {
          vm.onPatientDeceased(vm.patient);
        })
        .catch(error => {
          notifier.error($filter('translate')('COMMON_MESSAGE_ERROR_ACTION'));
        });
    }

    function deletePatient(reason) {
      return patientService.voidPatient(vm.patient.uuid, reason)
        .then(() => {
          linkSearch();
        })
        .catch(error => {
          notifier.error($filter('translate')('COMMON_MESSAGE_ERROR_ACTION'));
        });
    }

    function linkSearch() {
      $state.go('search');
    }

  }

})();

