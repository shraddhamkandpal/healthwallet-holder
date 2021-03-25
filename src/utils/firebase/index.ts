import {W3cCredential} from 'utils/apis/index'


export interface SignedCredentialFireBase {
    documentType: string
    signedCredential: W3cCredential
    archive: boolean
    store: boolean
    docID: string
}

export type GetSignedCredentialsFireBaseOutput = SignedCredentialFireBase[]