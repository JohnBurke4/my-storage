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

The webapp allows users to login and create their own accounts. Google Authentification provides the infrastructure for the accounts. I pass in the users email and password to create an account.

Once logged in, the user is brought to the files page. Here they can upload any number of files, which are encrypted and then stored in storage. These can be fetched and decoded for the user if they wish to view or download them.

The groups tab allows the user to create and view their groups. If a group exists that they are part of, the user can view any files uploaded by any other member of the group and upload other files themselves. This storage is separate to the private storage seen in the files tab. A user can then add or remove another user from the group.

Finally the Me tab allows the user to logout.

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

User and group files were encrypted using AES combined with the Public-Key Certs.

First metadata about each file to be uploaded is extracted. This includes the files name and mimetype. A random uuid is then generated and used at the encryption key. The file is encrypted using this key through AES from the Crypto-JS library. This encrypted file is stored into the firebase storage. The metadata extracted previously, along with the file's location in the storage and the encryption key are then encrypted using the user's public key and saved to database.

```javascript
const encryptFile = (file, key) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      var wordArray = CryptoJS.lib.WordArray.create(reader.result);
      var encrypted = CryptoJS.AES.encrypt(wordArray, key).toString();
      var fileEnc = new Blob([encrypted]);
      resolve(fileEnc);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

export const uploadFilesToDatabase = async (fileList) => {
  if (!fileList) return;

  const doc = await firestore.doc(`users/${auth.currentUser.uid}`).get();
  const pubKey = doc.data().publicKey;
  const key = uuidv4();

  const encryptedFiles = await encryptFiles(fileList, key);
  const encryptedKey = encryptWithPublicKey(pubKey, key);
  const userPath = `users/${auth.currentUser.uid}/files/`;
  for (let i = 0; i < encryptedFiles.length; i++) {
    let fileType = encryptWithPublicKey(pubKey, fileList[i].type);
    let fileName = encryptWithPublicKey(pubKey, fileList[i].name);
    const file = encryptedFiles[i];
    let guid = uuidv4();
    let fileReference = storage.ref().child(guid);
    try {
      let path = await fileReference.put(file).then((snapshot) => {
        console.log("Uploaded file!");
        return snapshot.metadata.fullPath;
      });
      const fileRef = await firestore.doc(userPath + guid);
      await fileRef.set({
        decryptionKey: encryptedKey,
        fileLocation: path,
        fileType: fileType,
        fileName: fileName,
      });
    } catch (error) {
      console.log(error);
      return;
    }
  }
};
```

To decrypt the files, the metadata is first pulled from the database and decrypted using the user's private key. This is displayed to the user in the Files page. If the user clicks on a file to download, the metadata is then used to find the encrypted file in the database, download it, decrypt it using the now decrypted decryption key, and add back it's name and mime-time. The decrypted file is then downloaded by the user.

```javascript
export const getUserFileTypesAndIds = async () => {
  let fileArr = [];
  try {
    const pk = window.sessionStorage.getItem("privateKey");
    const files = await firestore
      .collection(`users/${auth.currentUser.uid}/files`)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data();
          const name = decryptWithPrivateKey(pk, data.fileName);
          const loc = data.fileLocation;
          const decryptionKey = decryptWithPrivateKey(pk, data.decryptionKey);
          console.log(decryptionKey);
          const type = decryptWithPrivateKey(pk, data.fileType);
          fileArr.push({
            decryptionKey: decryptionKey,
            fileLocation: loc,
            fileType: type,
            fileName: name,
          });
        });
      });
    return fileArr;
  } catch (error) {
    console.error("Error fetching user", error);
  }
};

const decryptFile = (file, key, type) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      console.log(reader.result);
      var decrypted = CryptoJS.AES.decrypt(reader.result, key);
      var typedArray = convertWordArrayToUint8Array(decrypted);
      var fileEnc = new Blob([typedArray], { type: type });
      resolve(fileEnc);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
};
// Function taken from https://stackoverflow.com/questions/60520526/aes-encryption-and-decryption-of-files-using-crypto-js
const convertWordArrayToUint8Array = (wordArray) => {
  var arrayOfWords = wordArray.hasOwnProperty("words") ? wordArray.words : [];
  var length = wordArray.hasOwnProperty("sigBytes")
    ? wordArray.sigBytes
    : arrayOfWords.length * 4;
  var uInt8Array = new Uint8Array(length),
    index = 0,
    word,
    i;
  for (i = 0; i < length; i++) {
    word = arrayOfWords[i];
    uInt8Array[index++] = word >> 24;
    uInt8Array[index++] = (word >> 16) & 0xff;
    uInt8Array[index++] = (word >> 8) & 0xff;
    uInt8Array[index++] = word & 0xff;
  }
  return uInt8Array;
};
```

### **Group Function**

Adding Groups was the most difficult part of this assignment. A group consists of an ID, name and a list of userIds. When a current user wishes to upload a file to the group, which is seperate to the user's private storage, it encrypts and saves the files as it normally would. However the file metadata as well as the encryption key is encrypted seperately for each user, with their own public key, and saved to their section of the database. This allows each user to decrypt the files and no one else to.

```javascript
export const uploadFilesToGroup = async (groupId, fileList) => {
  if (!fileList) return;
  try {
    let userIds = [];
    const groupUsersRef = firestore.collection(`groups/${groupId}/users`);
    await groupUsersRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        userIds.push(doc.data().userId);
      });
    });

    let fileData = [];
    const key = uuidv4();
    const encryptedFiles = await encryptFiles(fileList, key);
    for (let i = 0; i < encryptedFiles.length; i++) {
      let fileType = fileList[i].type;
      let fileName = fileList[i].name;
      const file = encryptedFiles[i];
      let guid = uuidv4();
      let fileReference = storage.ref().child(guid);
      let path = await fileReference.put(file).then((snapshot) => {
        console.log("Uploaded file!");
        return snapshot.metadata.fullPath;
      });

      fileData.push({
        fileType: fileType,
        fileName: fileName,
        fileLocation: path,
      });
    }

    for (let i = 0; i < fileData.length; i++) {
      for (let j = 0; j < userIds.length; j++) {
        const doc = await firestore.doc(`users/${userIds[j]}`).get();
        const pubKey = doc.data().publicKey;
        const fileType = encryptWithPublicKey(pubKey, fileData[i].fileType);
        const fileName = encryptWithPublicKey(pubKey, fileData[i].fileName);
        const encryptedKey = encryptWithPublicKey(pubKey, key);
        const userPath = `users/${userIds[j]}/groups/${groupId}/files/`;
        const fileRef = firestore.doc(userPath + fileData[i].fileLocation);
        await fileRef.set({
          decryptionKey: encryptedKey,
          fileLocation: fileData[i].fileLocation,
          fileType: fileType,
          fileName: fileName,
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
};
```

Fetching the group files for each user functions the same as fetching the data for the individual files for each user.

A user can be added to the group by anyone already in the group. When added, all the group file's metadata is decrypted by the person who added the new user, and then reencrypted with the new users public key and uplaoded to their section of the database. To remove a user, all references to the group relating to the user are deleted.

```javascript
export const addToGroup = async (userId, groupId) => {
  const groupRef = firestore.doc(`groups/${groupId}/users/${userId}`);
  const email = await getUserEmail(userId);
  await groupRef.set({
    userId: userId,
    userEmail: email,
  });

  const userGroupRef = firestore.doc(`users/${userId}/groups/${groupId}`);
  await userGroupRef.set({
    groupId: groupId,
  });
  const doc = await firestore.doc(`users/${userId}`).get();
  const pubKey = doc.data().publicKey;
  let groupFiles = await getGroupFiles(groupId);
  for (let i = 0; i < groupFiles.length; i++) {
    const userPath = `users/${userId}/groups/${groupId}/files/`;
    const fileRef = firestore.doc(userPath + groupFiles[i].fileLocation);
    await fileRef.set({
      decryptionKey: encryptWithPublicKey(pubKey, groupFiles[i].decryptionKey),
      fileLocation: groupFiles[i].fileLocation,
      fileType: encryptWithPublicKey(pubKey, groupFiles[i].fileType),
      fileName: encryptWithPublicKey(pubKey, groupFiles[i].fileName),
    });
  }
};

export const removeUserFromGroup = async (userId, groupId) => {
  const groupRef = firestore.doc(`groups/${groupId}/users/${userId}`);
  await groupRef.delete();

  const userGroupRef = firestore.doc(`users/${userId}/groups/${groupId}`);
  await userGroupRef.delete();
};
```

As each file uploaded to the storage is encrypted, no one else can access it except for those in the group, who can decrypt the encryption key.

### **Code**

The rest of the code is too long to add to this PDF. It can all be found on my Github at [https://github.com/JohnBurke4/my-storage](https://github.com/JohnBurke4/my-storage). Similarly a live version of the web app can be found at [https://my-storage.vercel.app/](https://my-storage.vercel.app/).
