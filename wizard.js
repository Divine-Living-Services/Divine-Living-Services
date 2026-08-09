/* Divine Living Services — Referral Form Wizard
   Turns each long referral form into short, accessible steps.
   Notes:
   - Uses native HTML5 validation (required, type=email, etc.) per step.
   - Moves keyboard focus to each new step's heading/legend for screen reader users.
   - On submit, this sends the form data to your connected Formspree endpoint
     via fetch(), and shows a success message once Formspree confirms receipt. */

(function () {
  "use strict";

  function initWizard(form) {
    var panel = form.closest(".referral-panel");
    var steps = Array.prototype.slice.call(form.querySelectorAll(".wizard-step"));
    var progressSteps = panel.querySelectorAll(".wp-step");
    var progressLabel = panel.querySelector(".wizard-progress-label");
    var errorSummary = panel.querySelector(".wizard-error-summary");
    var successBox = panel.querySelector(".wizard-success");
    var total = steps.length;
    var current = 1;

    var stepNames = steps.map(function (step) {
      var legend = step.querySelector("legend");
      return legend ? legend.textContent : "";
    });

    function showStep(n) {
      steps.forEach(function (step) {
        var isActive = parseInt(step.dataset.step, 10) === n;
        step.classList.toggle("active", isActive);
      });
      progressSteps.forEach(function (ps) {
        var stepNum = parseInt(ps.dataset.wp, 10);
        ps.classList.toggle("active", stepNum === n);
        ps.classList.toggle("done", stepNum < n);
      });
      if (progressLabel) {
        progressLabel.textContent = "Step " + n + " of " + total + ": " + stepNames[n - 1];
      }
      errorSummary.classList.remove("show");
      errorSummary.textContent = "";

      var activeStep = steps[n - 1];
      var focusTarget = activeStep.querySelector("legend, h3");
      if (focusTarget) {
        focusTarget.setAttribute("tabindex", "-1");
        focusTarget.focus();
      }
      current = n;
    }

    function validateStep(step) {
      var fields = step.querySelectorAll("input, select, textarea");
      var firstInvalid = null;
      var valid = true;

      fields.forEach(function (field) {
        if (!field.checkValidity()) {
          valid = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });

      // Custom check: "services" checkbox groups marked as required via the group label
      var serviceGroup = step.querySelector('[role="group"][aria-labelledby$="services-label"]');
      if (serviceGroup) {
        var checked = serviceGroup.querySelectorAll('input[type="checkbox"]:checked');
        if (checked.length === 0) {
          valid = false;
          if (!firstInvalid) firstInvalid = serviceGroup.querySelector('input[type="checkbox"]');
          errorSummary.textContent = "Please select at least one service, and check any other highlighted fields.";
        }
      }

      if (!valid) {
        if (!errorSummary.textContent) {
          errorSummary.textContent = "Please fill in the required fields before continuing.";
        }
        errorSummary.classList.add("show");
        if (firstInvalid) firstInvalid.focus();
      }
      return valid;
    }

    form.querySelectorAll("[data-next]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var step = steps[current - 1];
        if (validateStep(step)) {
          showStep(Math.min(current + 1, total));
        }
      });
    });

    form.querySelectorAll("[data-back]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showStep(Math.max(current - 1, 1));
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var step = steps[current - 1];
      if (!validateStep(step)) return;

      var submitBtn = step.querySelector('button[type="submit"]');
      var originalLabel = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      var formData = new FormData(form);

      fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
      })
        .then(function (response) {
          if (response.ok) {
            form.style.display = "none";
            panel.querySelector(".wizard-progress").style.display = "none";
            if (progressLabel) progressLabel.style.display = "none";
            successBox.classList.add("show");
            successBox.setAttribute("tabindex", "-1");
            successBox.focus();
          } else {
            throw new Error("Submission failed");
          }
        })
        .catch(function () {
          errorSummary.textContent = "Something went wrong sending this — please try again, or email us directly using the details below.";
          errorSummary.classList.add("show");
          errorSummary.focus && errorSummary.setAttribute("tabindex", "-1");
          errorSummary.focus();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }
        });
    });

    showStep(1);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("form[data-wizard]").forEach(initWizard);
  });
})();
