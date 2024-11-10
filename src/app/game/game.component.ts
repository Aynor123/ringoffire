import { CommonModule, AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Game } from '../../models/game';
import { PlayerComponent } from "../player/player.component";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { GameInfoComponent } from "../game-info/game-info.component";
import { Firestore, collection, collectionData, doc, onSnapshot, addDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, PlayerComponent, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, FormsModule, MatDialogModule, GameInfoComponent, GameInfoComponent, AsyncPipe],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})

export class GameComponent {
  pickCardAnimation = false;
  game!: Game;
  currentCard: string | undefined = '';
  documentId: string = '';
  docId: any;


  unsubList: any;
  unsubSingle: any;


  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    public dialog: MatDialog) {

    // Get the document ID from the route parameters
    this.route.paramMap.subscribe(params => {
      this.docId = params.get('id');
      // if (this.docId) {
      //   this.listenToGameDocument(this.docId);
      // }
    });

    this.listenToGameDocumentVersionTwo();

    // this.unsubList = onSnapshot(collection(this.firestore, 'games'), (list) => {
    //   list.forEach(element => {
    //     console.log(this.setDatabaseObjectStructure(element.data(), element.id)); //entweder "element.id" oder "element.data()" ins log eintragen --> console.log(element.data()); //Die Funktion "setDatabaseObjectStructure" verwendet als ersten Parameter das element.data als object
    //   })
    // });
  }

  // ngOnDestroy() {
  //   this.unsubList(); // Warum muss ich destroyen? element id wird auch so ausgelesen.
  // }

  ngOnInit(): void {
    this.newGame();
  }

  // listenToGameDocument(docId: string) {
  //   this.unsubList = onSnapshot(doc(this.firestore, 'games', docId), (docSnapshot) => {
  //     if (docSnapshot.exists()) {
  //       console.log(docSnapshot.data());
  //     } else {
  //       console.log('Document does not exist');
  //     }
  //   });
  // }

  listenToGameDocumentVersionTwo() {
    this.unsubList = onSnapshot(doc(this.firestore, 'games', this.docId), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();

        // Update local game data with the data from Firestore
        this.game.players = data['players'] || [];
        this.game.stack = data['stack'] || [];
        this.game.playedCards = data['playedCards'] || [];
        this.game.currentPlayer = data['currentPlayer'] || 0;
        this.pickCardAnimation = data['pickCardAnimation'];

        console.log('Game data updated:', this.game);
      } else {
        console.log('Document does not exist');
      }
    });
  }

  setDatabaseObjectStructure(obj: any, id: string) { // Beispiel, um ein strukturiertes Object zu erstellen.
    return {
      players: this.game.players || "", //Wenn kene ID übergeben wird, dann wird "" ausgewählt.
      stack: this.game.stack || "note", // Wenn kein obj.title übergeben wird, dann wird "note" verwendet.
      playedCards: obj.content || "",
      currentPlayer: obj.marked || false // Geht auch mit boolean.
    }
  }

  newGame() {
    this.game = new Game();
  }

  takeCard() {
    if (!this.pickCardAnimation && this.currentCard !== undefined) {
      this.currentCard = this.game.stack.pop();
      this.pickCardAnimation = true;
      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
      this.updateDatabase(); //Muss abgespeichert werden damit die Animation abgespielt wird...

      setTimeout(() => {
        this.pickCardAnimation = false;
        this.game.playedCards.push(this.currentCard ?? 'defaultCard');
        this.updateDatabase(); // Und hier auch nochmal
      }, 1000)
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe(name => {
      if (name.length > 0) {
        this.game.players.push(name)
        this.updateDatabase();
        if (name !== undefined) {
        }
      }
    });
  }

  async updateDatabase() {
    let docRef = doc(this.firestore, 'games', this.docId); // Use the correct document reference

    try {
      await updateDoc(docRef, {
        players: this.game.players,
        stack: this.game.stack,
        playedCards: this.game.playedCards,
        currentPlayer: this.game.currentPlayer,
        pickCardAnimation: this.pickCardAnimation
      });
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  }
}
