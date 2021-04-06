import React, {useEffect, useState} from "react";
import {Alert, Table, Button, ControlLabel, FormControl, Checkbox, FormGroup, Modal} from "react-bootstrap";
import {useAsync, useAsyncFn} from "react-use";
import {useTokenModal} from "./TokenModal";
import queryString from 'query-string'
import {MessageService} from "../utils/messageService";
import './ShareCredential.css';

function parseInfoFromToken(token) {
    try {
        const { payload } = window.sdk.parseToken(token)
        const callbackURL = (payload.interactionToken || {}).callbackURL || undefined
        const requesterDid = payload.iss
        return { requesterDid, callbackURL }
    } catch(err) {
        return {}
    }
}
async function getCredentials(credentialShareRequestToken) {
    const credentials = await window.sdk.getCredentials(credentialShareRequestToken)
    if (!Array.isArray(credentials) || credentials.length < 1) {
        throw new Error('No credential found for this request!')
    }
    return credentials
}
async function createCredentialShareResponseToken(credentialShareRequestToken, credentials, requesterDid, shouldSendMessage) {
    const credentialShareResponseToken = await window.sdk.createCredentialShareResponseToken(credentialShareRequestToken, credentials)
    console.log('credentialShareResponseToken: ', credentialShareResponseToken);
    const verifiablePresentation = await window.sdk.createPresentationFromChallenge(credentialShareRequestToken, credentials, 'domain')
    console.log('verifiablePresentation: ', verifiablePresentation);
    console.log('-----');
    console.log('shouldSendMessage: ', shouldSendMessage);
    console.log('requesterDid: ', requesterDid);
    if (shouldSendMessage && requesterDid) {
        console.log('-----if-------');
        console.log(window);
        console.log(window.messageService);
        console.log(window.messageService.send);
        const mes = await window.messageService.send(requesterDid, { token: credentialShareResponseToken })
        console.log('mes: ', mes);
    }
    return { credentialShareResponseToken, verifiablePresentation }
}
async function sendVPToCallback(callbackURL, { verifiablePresentation }) {
    const response = await fetch(callbackURL, {
        method: 'POST',
        // mode: 'no-cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vp: verifiablePresentation })
    })
    if (response.status < 200 || response.status > 299) {
        throw new Error(`${callbackURL} responded with ${response.statusText}`)
    }
    if (response.status === 204) {
        return undefined
    }
    return response.json()
}
const ShareCredential = (props) => {
    const credentialShareRequestToken = queryString.parse(props.location.search).token || ''
    console.log('Credential Share Request Token', credentialShareRequestToken);
    const { open: openTokenModal } = useTokenModal()
    const { requesterDid, callbackURL } = parseInfoFromToken(credentialShareRequestToken)
    const [shouldSendMessage, setShouldSendMessage] = useState(true);
    useEffect(() => {
      window.sdk.init().then(networkMember => {
        window.messageService = new MessageService(networkMember)
      }).catch(console.error)
  }, [])
    const { loading: credentialsLoading, value: credentials, error: credentialsError } = useAsync(
        () => getCredentials(credentialShareRequestToken),
        [credentialShareRequestToken]
    )
    const [
        { loading: createVPLoading, value: presentation, error: createVPError },
        onCreateVP
    ] = useAsyncFn(
        () => createCredentialShareResponseToken(credentialShareRequestToken, credentials, requesterDid, shouldSendMessage),
        [credentialShareRequestToken, credentials, requesterDid, shouldSendMessage]
    );
    const [{ loading: callbackLoading, value: callbackResponse, error: callbackError }, sendVP] = useAsyncFn(
        () => sendVPToCallback(callbackURL, presentation),
        [callbackURL, presentation]
    )
    useEffect(() => {
        if (callbackURL && presentation) {
            sendVP()
        }
    }, [callbackURL, presentation, sendVP])
    const shareButtonDisabled = credentialsLoading || !!credentialsError || credentials.length < 1 || createVPLoading || callbackLoading || !!presentation
    const alert = getAlert(callbackURL, callbackLoading, callbackResponse, callbackError, credentialsError, createVPError)
    useEffect(() => {
        if (callbackResponse && callbackResponse.requestToken) {
            const { requestToken } = callbackResponse
            openTokenModal(requestToken)
        }
    }, [callbackResponse, openTokenModal, props.onClose])
    
    return (
        <div className='ShareCred'>
            <div className='Form container'>
                <h1 className='Title'>Share Credentials</h1>
                <Button onClick={onCreateVP}>Share Credentials</Button>
            </div>
        </div>
    )
}

export default ShareCredential;

function getAlert(callbackURL, callbackLoading, callbackResponse, callbackError, credentialsError, createVPError) {
    if (callbackURL && (callbackLoading || callbackResponse || callbackError)) {
        if (callbackLoading) {
            return { message: 'Sending VP to callbackURL.', bsStyle: 'warning' }
        }
        if (callbackResponse) {
            return { message: 'Sent VP to callbackURL successfully.', bsStyle: 'success' }
        }
        if (callbackError) {
            return { message: `There was an error sending VP to callbackURL. Error: ${callbackError.message}`, bsStyle: 'danger' }
        }
    }
    if (credentialsError) {
        return { message: `Could not list credentials. Error: ${credentialsError.message}`, bsStyle: 'danger' }
    }
    if (createVPError) {
        return { message: `Could not create VP. Error: ${createVPError.message}`, bsStyle: 'danger' }
    }
    return undefined
}