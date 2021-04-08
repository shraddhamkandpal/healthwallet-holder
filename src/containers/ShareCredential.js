import React, {useEffect, useState} from "react";
import {Alert, Table, Button, ToggleButton, ButtonGroup, Form} from "react-bootstrap";
import {useAsync, useAsyncFn} from "react-use";
import {useTokenModal} from "./TokenModal";
import queryString from 'query-string'
import {MessageService} from "../utils/messageService";
import './ShareCredential.css';
import { useHistory } from 'react-router-dom';

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
    const history = useHistory();

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
        (credentials) => createCredentialShareResponseToken(credentialShareRequestToken, credentials, requesterDid, shouldSendMessage),
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

    useEffect(() => {
        if (presentation) {
            alert('You have successfully shared the credential.')
            history.push('/')
        }
        if (createVPError) {
            alert('Something wrong came up. Please try to share again.')
        }
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [presentation, createVPError])

    const shareButtonDisabled = credentialsLoading || !!credentialsError || credentials.length < 1 || createVPLoading || callbackLoading || !!presentation
    const alert_ = getAlert(callbackURL, callbackLoading, callbackResponse, callbackError, credentialsError, createVPError)
    useEffect(() => {
        if (callbackResponse && callbackResponse.requestToken) {
            const { requestToken } = callbackResponse
            openTokenModal(requestToken)
        }
    }, [callbackResponse, openTokenModal, props.onClose])

    const searchKeyDetail = (credential) => {
        const types = credential.type
        if (types[types.length-1] === 'NameCredentialPersonV1') {
            return 'Name Document'
        }
        if (types[types.length-1] === 'IDDocumentCredentialPersonV1') {
            if (credential.credentialSubject.data.hasIDDocument.hasIDDocument.documentType === 'driving_license') {
                return 'Driving License'
            }
        }
        return 'Cannot be found'
    }
    
    return (
        <div className='ShareCred'>
            <div className='Form container'>
                <h1 className='Title'>Share Credentials</h1>
                <p>Please select which Credential you would like to share</p>
                <Table striped bordered hover size='sm'>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Select</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(credentials || []).map((credential, index) => (
                            <tr key={credential.id}>
                                {console.log(credential)}
                                <td>{index + 1}</td>
                                <td>{credential.credentialSubject.data.givenName} {credential.credentialSubject.data.familyName}</td>
                                <td>{searchKeyDetail(credential)}</td>
                                <td>
                                    <Button onClick={() => onCreateVP([credential])}>Share</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
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