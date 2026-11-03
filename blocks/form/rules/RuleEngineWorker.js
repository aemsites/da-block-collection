/** ***********************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2024 Adobe
 * All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.

 * Adobe permits you to use and modify this file solely in accordance with
 * the terms of the Adobe license agreement accompanying it.
 ************************************************************************ */
import { createFormInstance } from './model/afb-runtime.min.js';
import registerCustomFunctions from './functionRegistration.js';
import { fetchData } from '../util.js';
import { getLogLevelFromURL } from '../constant.js';

let customFunctionRegistered = false;

/**
 * Main thread ↔ Worker message protocol:
 *
 * Main → Worker:
 * - createFormInstance: Initialize worker with form definition. Payload: formDef + search params.
 *                       Worker creates form instance and returns initial state.
 * - decorated:          Main thread HTML rendering complete. Worker applies prefill data and
 *                       sends restore state + batched field changes.
 *
 * Worker → Main:
 * - renderForm:         Sent after createFormInstance. Payload: form state.
 *                       Main thread renders HTML form.
 * - restoreState:       Sent after 'decorated'. Payload: { state }.
 *                       Main thread runs loadRuleEngine(state, ...).
 * - applyFieldChanges:  Unified field change message. Payload: { fieldChanges }.
 *                       fieldChanges is an array (batched during restore) or
 *                       a single object (live phase).
 *                       Main thread runs fieldChanged + applyFieldChangeToFormModel.
 * - applyLiveFormChange: Sent per form-level 'change' (live phase). Payload: form change.
 *                       Main thread updates form properties (e.g. polling success).
 * - sync-complete:      Sent after all restore field changes applied. Main thread removes
 *                       'loading' class from form.
 */
export default class RuleEngine {
  rulesOrder = {};

  fieldChanges = [];

  postRestoreFieldChanges = [];

  /** True after all restore field changes are sent; then post each field/form change live. */
  postRestoreCompleteSent = false;

  /** True after restoreState until batched applyFieldChanges; collect field changes. */
  restoreSent = false;

  constructor(formDef, url) {
    const logLevel = getLogLevelFromURL(url);
    this.form = createFormInstance(formDef, undefined, logLevel);
    this.form.subscribe((e) => {
      const { payload } = e;
      this.handleFieldChanged(payload);
    }, 'fieldChanged');

    this.form.subscribe((e) => {
      const { payload } = e;
      if (this.postRestoreCompleteSent) {
        postMessage({
          name: 'applyLiveFormChange',
          payload,
        });
      }
    }, 'change');
  }

  handleFieldChanged(payload) {
    if (this.postRestoreCompleteSent) {
      postMessage({
        name: 'applyFieldChanges',
        payload: { fieldChanges: payload },
      });
    } else if (this.restoreSent) {
      this.postRestoreFieldChanges.push(payload);
    } else {
      this.fieldChanges.push(payload);
    }
  }

  getState() {
    return this.form.getState(true);
  }

  getFieldChanges() {
    return this.fieldChanges;
  }

  getCustomFunctionsPath() {
    return this.form?.properties?.customFunctionsPath || '../functions.js';
  }
}

let ruleEngine;
let initPayload;
onmessage = async (e) => {
  async function handleMessageEvent(event) {
    switch (event.data.name) {
      case 'createFormInstance': {
        const { search, ...formDef } = event.data.payload;
        initPayload = event.data.payload;
        ruleEngine = new RuleEngine(formDef, event.data.url);
        const state = ruleEngine.getState();
        postMessage({
          name: 'renderForm',
          payload: state,
        });
        ruleEngine.dispatch = (msg) => {
          postMessage(msg);
        };
        break;
      }
      default:
        break;
    }
  }

  // Prefill form data, wait for async ops, then restore state and sync field changes to main.
  if (e.data.name === 'decorated') {
    const { search, ...formDef } = initPayload;
    const needsPrefill = formDef?.properties?.['fd:formDataEnabled'] === true;
    const data = needsPrefill ? await fetchData(formDef.id, search) : null;
    if (data) {
      ruleEngine.form.importData(data);
    }
    await ruleEngine.form.waitForPromises();
    postMessage({
      name: 'restoreState',
      payload: {
        state: ruleEngine.getState(),
      },
    });
    ruleEngine.restoreSent = true;
    await new Promise((r) => {
      setTimeout(r, 0);
    });
    const allFieldChanges = [
      ...ruleEngine.getFieldChanges(),
      ...ruleEngine.postRestoreFieldChanges,
    ];
    if (allFieldChanges.length > 0) {
      postMessage({
        name: 'applyFieldChanges',
        payload: { fieldChanges: allFieldChanges },
      });
    }
    ruleEngine.postRestoreCompleteSent = true;
    ruleEngine.restoreSent = false;
    ruleEngine.postRestoreFieldChanges = [];
    postMessage({
      name: 'sync-complete',
    });
  }

  if (!customFunctionRegistered) {
    const codeBasePath = e?.data?.codeBasePath;
    const customFunctionPath = e?.data?.payload?.properties?.customFunctionsPath || '/blocks/form/functions.js';
    registerCustomFunctions(customFunctionPath, codeBasePath).then(() => {
      customFunctionRegistered = true;
      handleMessageEvent(e);
    });
  }
};
