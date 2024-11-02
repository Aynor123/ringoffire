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
import { Firestore, collection, collectionData, doc, onSnapshot, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';


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
  firestore: Firestore = inject(Firestore);

  // items$: Observable<any[]>;

  unsubList: any;
  unsubSingle: any;


  constructor(public dialog: MatDialog) {
    this.unsubList = onSnapshot(collection(this.firestore, 'games'), (list) => {
      list.forEach(element => {
        console.log(this.setDatabaseObjectStructure(element.data(), element.id)); //entweder "element.id" oder "element.data()" ins log eintragen --> console.log(element.data()); //Die Funktion "setDatabaseObjectStructure" verwendet als ersten Parameter das element.data als object
      })
    });

    // this.unsubSingle = onSnapshot(collection(this.firestore, 'games'), (list) => {
    //   list.forEach(element => {
    //     console.log(element);
    //   })
    // });
    // this.unsubSingle();

    // let gamesCollection = collection(this.firestore, 'games');
    // this.items$ = collectionData(gamesCollection);
  }

  ngOnDestroy() {
    this.unsubList(); // Warum muss ich destroyen? element id wird auch so ausgelesen.
  }

  async createDataOnFirestore() { //addDoc importieren!
    await addDoc(collection(this.firestore, "games"), {
      players: this.game.players, //Wenn kene ID übergeben wird, dann wird "" ausgewählt.
      stack: this.game.stack, // Wenn kein obj.title übergeben wird, dann wird "note" verwendet.
      playedCards: this.game.playedCards,
      currentPlayer: this.game.currentPlayer// Geht auch mit boolean.
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

  ngOnInit(): void {
    this.newGame();
    this.createDataOnFirestore();
    // console.log('Game update: ', this.items$);
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

      setTimeout(() => {
        this.pickCardAnimation = false;
        this.game.playedCards.push(this.currentCard ?? 'defaultCard');
      }, 1000)
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe(name => {
      if (name.length > 0) {
        this.game.players.push(name)
        if (name !== undefined) {
        }
      }
    });
  }
}
