export const getCurrentFolder = async (reference: any, pageToken?: any) => {
  let folderArr: any[] = [];
  return reference.list({pageToken}).then((result: any) => {
    // Loop over each item
    const arr = result._prefixes;
    for (const item of arr) {
      folderArr.push(item.fullPath);
    }
    if (result.nextPageToken) {
      return getCurrentFolder(reference, result.nextPageToken);
    }
    return folderArr;
  });
};

export const getFolderLength = async (reference: any, pageToken?: any) => {
  let imgsArr: any[] = [];
  return reference.list({pageToken}).then((result: any) => {
    const imgArr = result._items;
    for (const i of imgArr) {
      imgsArr.push(i.fullPath);
    }
    if (result.nextPageToken) {
      return getFolderLength(reference, result.nextPageToken);
    }
    return imgsArr;
  });
};

// {"_items":
// [{"_storage": [FirebaseStorageModule],
// "path": "users/mwpTeuVuKoTWbGi0ntM5SJB1C6K2/image-0"},
// {"_storage": [FirebaseStorageModule],
// "path": "users/mwpTeuVuKoTWbGi0ntM5SJB1C6K2/image-1"},
// {"_storage": [FirebaseStorageModule],
// "path": "users/mwpTeuVuKoTWbGi0ntM5SJB1C6K2/image-10"},
// {"_storage": [FirebaseStorageModule],
// "path": "users/mwpTeuVuKoTWbGi0ntM5SJB1C6K2/image-11"}],
// "_nextPageToken": null,
// "_prefixes":
// [{"_storage": [FirebaseStorageModule],
// "path": "users/mwpTeuVuKoTWbGi0ntM5SJB1C6K2/20230223150211"},
// {"_storage": [FirebaseStorageModule],
// "path": "users/mwpTeuVuKoTWbGi0ntM5SJB1C6K2/20230223150244"},
// {"_storage": [FirebaseStorageModule],
// "path": "users/mwpTeuVuKoTWbGi0ntM5SJB1C6K2/images"}]}
