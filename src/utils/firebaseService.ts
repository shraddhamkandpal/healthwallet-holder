import firebase from 'utils/firebase/config';
import {GetSignedCredentialsFireBaseOutput} from 'utils/firebase/index';


export default class FireBaseService {
    /**
     * Method for retrieving approved Driving License VCs from FireBase
     */
    didToken: string;

    constructor(didToken: string) {
        this.didToken = didToken;
    }

    async fetchDrivingLicenseApproved() {
        const db = firebase.firestore();
        const fetch: any = await db.collection("did:elem:EiDgWR1ACE0ckzFqtrp1LGN7Vs5WxFxlMnaUktGkjO4BIw").get();
        console.log(fetch);
        const information: GetSignedCredentialsFireBaseOutput = fetch.docs.map((doc: any) => {
            return {
                ...doc.data(),
                docID: doc.id
            }
        })
        return information;
    }

    /**
     * Method for archiving approved documents
     */
    async archiveDrivingLicenseApproved(docId: string) {
        const db = firebase.firestore();
        const fetch: any = await db.collection("did:elem:EiDgWR1ACE0ckzFqtrp1LGN7Vs5WxFxlMnaUktGkjO4BIw").doc(docId);
        await fetch.update({archive: true});
    }

    /**
     * Method to set the stored flag for approved documents
     */
    async storeDrivingLicenseApproved(docId: string) {
        const db = firebase.firestore();
        const fetch: any = await db.collection("did:elem:EiDgWR1ACE0ckzFqtrp1LGN7Vs5WxFxlMnaUktGkjO4BIw").doc(docId);
        await fetch.update({store: true});
    }

    /**
   * Method for showing the user a generic message when a request fails or an error has been thrown.
   * */
    static alertWithBrowserConsole(consoleMessage: null | string | string[] = null, alertMessage?: string) {
        if( consoleMessage ) {
            console.log(consoleMessage);
        }
        alert(alertMessage || 'There has been an issue processing your request. Please check the browser console.')
    }

}