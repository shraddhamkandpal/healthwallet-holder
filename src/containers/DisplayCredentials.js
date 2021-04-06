import React from 'react';

const DisplayCredentials = ({cred}) => {
    const { givenName, familyName } = cred.credentialSubject.data;
    const { documentType } = cred.credentialSubject.data.hasIDDocument.hasIDDocument;
    
    return (
        <>
            <h3>Approved Verifiable Credential</h3>
            <p><strong>Given Name:</strong> {givenName}</p>
            <p><strong>Family Name:</strong> {familyName}</p>
            <p><strong>Document Type:</strong> {documentType}</p>
        </>
    )   
}

export default DisplayCredentials;