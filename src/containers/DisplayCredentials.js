import React from 'react';

const DisplayCredentials = ({cred}) => {
    console.log(cred)
    const { givenName, familyName } = cred.credentialSubject.data;
    const { documentType, issueDate, issuer } = cred.credentialSubject.data.hasIDDocument.hasIDDocument;
    
    return (
        <>
            <p><strong>Issuer:</strong> {issuer}</p>
            <p><strong>Expiry Date:</strong> {issueDate}</p>
            <p><strong>Record Type:</strong> {documentType}</p>
        </>
    )   
}

export default DisplayCredentials;