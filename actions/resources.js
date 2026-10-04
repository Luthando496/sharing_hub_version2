// actions/resources.js
'use server';

import { db } from '../firebase';
import { collection, doc, getDoc, query, where, limit, getDocs } from 'firebase/firestore';

//  GET ALL POSTS IN FIREBASE
export async function fetchAllPosts() {
  try {
    const postsCollection = collection(db, 'student_posts');
    const querySnapshot = await getDocs(postsCollection);
    const posts = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const uploadDate = data.uploadDate && data.uploadDate.toDate
        ? data.uploadDate.toDate().toISOString()
        : data.uploadDate || '';

      posts.push({
        id: doc.id,
        title: data.title || '',
        authorId: data.authorId || '',
        description: data.description || '',
        category: data.category || '',
        type: data.type || '',
        uploadDate,
        downloads: data.downloads || 0,
        image: data.image || '',
        fileName: data.fileName || '',
        fileURL: data.fileURL || '',
      });
    });

    return posts;
  } catch (error) {
    console.error('Failed to fetch all posts:', error);
    return [];
  }
}

//  GET POSTS BY ID IN FIREBASE
export async function getPostById(id) {
  try {
    const postId = Array.isArray(id) ? id[0] : id;

    if (!postId) {
      console.error('No ID provided');
      return null;
    }

    const docRef = doc(db, 'student_posts', postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const uploadDate = data.uploadDate && data.uploadDate.toDate
        ? data.uploadDate.toDate().toISOString()
        : data.uploadDate || '';

      return {
        id: docSnap.id,
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        type: data.type || '',
        uploadDate,
        downloads: data.downloads || 0,
        thumbnailURL: data.thumbnailURL || '',
        authorId: data.authorId || '',
        image: data.image || '',
        fileName: data.fileName || '',
        fileURL: data.fileURL || '',
      };
    } else {
      console.log('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error getting document:', error);
    return null;
  }
}

// Posts in the same category, excluding the current one
export async function getRelatedPosts(category, currentPostId) {
  try {
    const q = query(
      collection(db, 'student_posts'),
      where('category', '==', category),
      limit(4)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs
      .filter((d) => d.id !== currentPostId)
      .slice(0, 3)
      .map((d) => {
        const data = d.data();
        const uploadDate = data.uploadDate && data.uploadDate.toDate
          ? data.uploadDate.toDate().toISOString()
          : data.uploadDate || '';

        return {
          id: d.id,
          title: data.title || '',
          authorId: data.authorId || '',
          description: data.description || '',
          category: data.category || '',
          type: data.type || '',
          uploadDate,
          downloads: data.downloads || 0,
          image: data.image || '',
          fileName: data.fileName || '',
        };
      });
  } catch (error) {
    console.error('Error getting related posts:', error);
    return [];
  }
}
