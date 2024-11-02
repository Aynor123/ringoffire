import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(), provideAnimationsAsync(), provideFirebaseApp(() => initializeApp({"projectId":"ring-of-fire-a4e73","appId":"1:527893448907:web:85727c2f8f3c45386af34e","storageBucket":"ring-of-fire-a4e73.firebasestorage.app","apiKey":"AIzaSyA9UYsPBK5ndCaxuupiGiqbapQLoviw2Nw","authDomain":"ring-of-fire-a4e73.firebaseapp.com","messagingSenderId":"527893448907"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideDatabase(() => getDatabase())]
};
