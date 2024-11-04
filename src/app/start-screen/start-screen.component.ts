import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { Game } from '../../models/game';

@Component({
  selector: 'app-start-screen',
  standalone: true,
  imports: [],
  templateUrl: './start-screen.component.html',
  styleUrl: './start-screen.component.scss'
})
export class StartScreenComponent {
  game!: Game;
  docId: any; // DocRef ist meine DokumentenI
  constructor(private router: Router, private firestore: Firestore) {
  }

  async newGame() {
    this.createNewGame();
    await this.createDataOnFirestore();
    this.navigateToNewGameDocId();

  }

  createNewGame() {
    this.game = new Game();
  }

  async createDataOnFirestore() {
    try {
      this.docId = await addDoc(collection(this.firestore, 'games'), {
        players: this.game.players || '',
        stack: this.game.stack || 'note',
        playedCards: this.game.playedCards || [],
        currentPlayer: this.game.currentPlayer || false,
      });
    } catch (error) {
      console.error('Error creating document in database: ', error);
    }
  }

  navigateToNewGameDocId() {
    if (this.docId) {
      this.router.navigate(['/game', this.docId.id]);
    }
  }
}
