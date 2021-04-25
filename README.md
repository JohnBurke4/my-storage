#

# **CSU34031 Advanced Telecommunications**

## **Secure Cloud Storage - John Burke - 18326420**

The repository for this project can be found at [https://github.com/JohnBurke4/my-storage](https://github.com/JohnBurke4/my-storage) and a live deployment can be found at [https://my-storage.vercel.app/](https://my-storage.vercel.app/).

### **Task**

The aim of this project is to develop a secure cloud storage application for Dropbox, Box, Google Drive, Office365 etc. For example, your application will secure all files that are uploaded to the cloud, such that only people that are part of your &quot;Secure Cloud Storage Group&quot; will be able to decrypt uploaded files. Any member of the group should be able to upload encrypted files to the cloud service. To all other users the files will be encrypted.

You are required to design and implement a suitable **key management** system for your application which employs **public-key certificates** that allows users of the system to **share files securely** , and also allows one to **add or remove users** from the group. You are free to implement your application for a desktop or mobile platform and make use of any open source cryptographic libraries.

### **Approach Overview**

My application consists of a React Javascript webapp supported by a Google Firebase backend. Firebase provided secure user authentification through firebase auth, file storage with firebase storage and a document-led database with firestore.

All cryptographic functions were gotten through the Crypto-JS and Node-RSA libraries.

### **Application Overview**

### **Key Management**

Node-RSA provided the code to use public-key encryption. Each key was generated when a user was created. All I had to deal with was the storage. The public key cert was easy, this could simply be stored publically in the database as we wanted people to use it. This could then be accessed by anyone who had the users unique ID.

The private key was ultimately also stored in the database. However it was first encrypted by AES with the users password. This encrypted key is then pulled down every time the user logs in, decrypted using their password and stored in the sessionStorage. SessionStorage was used to ensure that the private key was wiped from local storage when the user closed the app.

```javascript
export const getUserPrivateKeyAndDecrypt = async (password) => {
  try {
    const doc = await firestore.doc(`users/${auth.currentUser.uid}`).get();
    const bytes = AES.decrypt(doc.data().privateKey, password);
    const pk = bytes.toString(Utf8);
    window.sessionStorage.setItem("privateKey", pk);
    console.log(pk);
  } catch (error) {
    console.error("Error fetching user", error);
  }
};
```

These keys could then be used to decrypt file data and file decryption keys themselves:

```javascript
const encryptWithPublicKey = (pubK, message) => {
  const key = new NodeRSA({ b: 512 });
  key.importKey(pubK);
  return key.encrypt(message, "base64").toString();
};

const decryptWithPrivateKey = (priK, message) => {
  const key = new NodeRSA({ b: 512 });
  key.importKey(priK);
  return key.decrypt(message, "utf8").toString();
};
```

### **File Encryption and Storage**

### **Group Function**

### **Code**

The code itself is too long to add to this PDF. It can all be found on my Github at [https://github.com/JohnBurke4/my-storage](https://github.com/JohnBurke4/my-storage). Similarly a live version of the web app can be found at [https://my-storage.vercel.app/](https://my-storage.vercel.app/).
