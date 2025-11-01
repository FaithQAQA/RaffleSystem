import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-live-raffle',
  templateUrl: './live-raffle.page.html',
  styleUrls: ['./live-raffle.page.scss'],
  standalone: false
})
export class LiveRafflePage implements OnInit, OnDestroy {
  raffle: any = null;
  countdown: string = '00:00';
  isLive: boolean = false;
  loading: boolean = true;
  error: string = '';

  // Real-time data
  currentUser: any = null;
  userTicketCount: number = 0;
  userWinningChance: number = 0;
  previousTicketCount: number = 0;
  liveUpdates: string[] = [];
  winner: any = null;
  isDrawingWinner: boolean = false;
  isFetchingWinnerDetails: boolean = false;

  private timerSubscription?: Subscription;
  private refreshSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    const raffleId = this.route.snapshot.paramMap.get('id');
    if (raffleId) {
      this.loadCurrentUserProfile();
      this.fetchRaffleDetails(raffleId);
      this.startRealTimeUpdates(raffleId);
    } else {
      this.error = 'Invalid raffle ID';
      this.loading = false;
    }
  }

  loadCurrentUserProfile() {
    this.apiService.getCurrentUserProfile().subscribe({
      next: (userData) => {
        this.currentUser = userData;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
      }
    });
  }

  fetchRaffleDetails(raffleId: string) {
    this.apiService.getRaffleById(raffleId).subscribe({
      next: (raffleData) => {
        this.raffle = raffleData;
        this.checkRaffleStatus();
        this.startCountdown();
        this.calculateUserTicketCount();
        this.loadWinningChance(raffleId);
        this.checkForWinner();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching raffle:', error);
        this.error = 'Failed to load raffle details';
        this.loading = false;
      }
    });
  }

  startRealTimeUpdates(raffleId: string) {
    // Refresh data every 10 seconds for real-time updates
    this.refreshSubscription = interval(10000).subscribe(() => {
      if (this.isLive && !this.winner && !this.isDrawingWinner) {
        this.refreshRaffleData(raffleId);
      }
    });
  }

  refreshRaffleData(raffleId: string) {
    this.apiService.getRaffleById(raffleId).subscribe({
      next: (raffleData) => {
        const oldTicketCount = this.raffle.totalTicketsSold;
        this.raffle = raffleData;

        // Check for new ticket purchases
        if (raffleData.totalTicketsSold > oldTicketCount) {
          const newTickets = raffleData.totalTicketsSold - oldTicketCount;
          this.addLiveUpdate(`🎫 ${newTickets} new ticket(s) purchased!`);
        }

        // Update user data
        this.calculateUserTicketCount();
        this.loadWinningChance(raffleId);
        this.checkForWinner();
      },
      error: (error) => {
        console.error('Error refreshing raffle:', error);
      }
    });
  }

  calculateUserTicketCount() {
    if (!this.raffle || !this.raffle.participants || !this.currentUser) {
      this.userTicketCount = 0;
      return;
    }

    const userParticipant = this.raffle.participants.find(
      (p: any) => p.userId && p.userId._id === this.currentUser._id
    );

    const newTicketCount = userParticipant ? userParticipant.ticketsBought : 0;

    // Check if user bought more tickets
    if (newTicketCount > this.userTicketCount && this.userTicketCount > 0) {
      const additionalTickets = newTicketCount - this.userTicketCount;
      this.addLiveUpdate(`🎯 You purchased ${additionalTickets} more ticket(s)!`);
    }

    this.userTicketCount = newTicketCount;
  }

  loadWinningChance(raffleId: string) {
    if (!this.currentUser) return;

    this.apiService.getRaffleWinningChance(raffleId, this.currentUser._id).subscribe({
      next: (chanceData) => {
        const oldChance = this.userWinningChance;
        this.userWinningChance = chanceData.winningChance || 0;

        // Notify if winning chance changed significantly
        if (Math.abs(this.userWinningChance - oldChance) > 1 && oldChance > 0) {
          this.addLiveUpdate(`📊 Your winning chance is now ${this.userWinningChance.toFixed(1)}%`);
        }
      },
      error: (error) => {
        console.error('Error loading winning chance:', error);
      }
    });
  }

  checkForWinner() {
    if (this.raffle && this.raffle.winner && !this.winner) {
      console.log('Winner object structure:', this.raffle.winner);
      console.log('Winner type:', typeof this.raffle.winner);

      // If winner is just an ID string, fetch user details
      if (typeof this.raffle.winner === 'string') {
        this.fetchWinnerDetails(this.raffle.winner);
      } else {
        this.winner = this.raffle.winner;
        this.isLive = false;
        this.isDrawingWinner = false;
        this.announceWinner();
      }
    }
  }

  fetchWinnerDetails(winnerId: string) {
    this.isFetchingWinnerDetails = true;

    this.apiService.getUserById(winnerId).subscribe({
      next: (userData) => {
        this.winner = userData;
        this.isLive = false;
        this.isDrawingWinner = false;
        this.isFetchingWinnerDetails = false;
        this.announceWinner();
      },
      error: (error) => {
        console.error('Error fetching winner details:', error);
        // Fallback: create a basic winner object
        this.winner = { _id: winnerId, username: 'Winner' };
        this.isFetchingWinnerDetails = false;
        this.announceWinner();
      }
    });
  }

  announceWinner() {
    if (this.currentUser && this.winner._id === this.currentUser._id) {
      this.addLiveUpdate('🏆 🎉 CONGRATULATIONS! YOU WON THE RAFFLE! 🎉 🏆');
    } else {
      this.addLiveUpdate(`🏆 Winner selected: ${this.getWinnerDisplayName()}`);
    }

    // Stop real-time updates after winner is selected
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  getWinnerDisplayName(): string {
    if (!this.winner) return 'Unknown';

    // If winner is just a string ID (still loading)
    if (typeof this.winner === 'string') {
      return 'Loading...';
    }

    // If winner has username
    if (this.winner.username) {
      return this.winner.username;
    }

    // If winner has name
    if (this.winner.name) {
      return this.winner.name;
    }

    // If winner has email
    if (this.winner.email) {
      return this.winner.email.split('@')[0]; // Use part of email
    }

    return 'Winner';
  }

  checkRaffleStatus() {
    if (!this.raffle) return;

    const now = new Date();
    const startTime = new Date(this.raffle.startDate);
    const endTime = new Date(this.raffle.endDate);

    if (now >= startTime && now <= endTime) {
      this.isLive = true;
      this.addLiveUpdate('🚀 Raffle is now LIVE!');
    } else if (now > endTime) {
      this.isLive = false;
      if (!this.winner && !this.isDrawingWinner) {
        this.addLiveUpdate('⏰ Raffle ended - drawing winner...');
        this.triggerWinnerSelection();
      }
    }
  }

  startCountdown() {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.raffle && !this.winner && !this.isDrawingWinner) {
        const now = new Date();
        const endTime = new Date(this.raffle.endDate);
        const timeDiff = endTime.getTime() - now.getTime();

        if (timeDiff <= 0) {
          this.isLive = false;
          this.countdown = '00:00';
          this.addLiveUpdate('⏰ Time\'s up! Drawing winner...');
          this.timerSubscription?.unsubscribe();

          // Trigger winner selection
          this.triggerWinnerSelection();
        } else {
          const minutes = Math.floor(timeDiff / (1000 * 60));
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
          this.countdown = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

          // Add countdown warnings
          if (minutes === 1 && seconds === 0) {
            this.addLiveUpdate('⏰ 1 minute remaining!');
          } else if (minutes === 0 && seconds === 30) {
            this.addLiveUpdate('⏰ 30 seconds remaining!');
          }
        }
      }
    });
  }

  triggerWinnerSelection() {
    if (this.isDrawingWinner) return; // Prevent multiple calls

    this.isDrawingWinner = true;
    this.addLiveUpdate('🎲 Selecting winner...');

    // Call the pickWinner API endpoint
    this.callPickWinner();
  }

  callPickWinner() {
    if (!this.raffle) return;

    this.apiService.pickWinner(this.raffle._id).subscribe({
      next: (winnerResponse) => {
        this.addLiveUpdate('✅ Winner selection complete!');
        this.isDrawingWinner = false;

        // Start checking for the winner
        this.startWinnerCheck();
      },
      error: (error) => {
        console.error('Error picking winner:', error);
        this.addLiveUpdate('❌ Error selecting winner, retrying...');
        this.isDrawingWinner = false;

        // Retry after 5 seconds
        setTimeout(() => this.triggerWinnerSelection(), 5000);
      }
    });
  }

  startWinnerCheck() {
    // Check for winner every 3 seconds after countdown ends
    this.refreshSubscription = interval(3000).subscribe(() => {
      if (this.raffle && !this.winner) {
        this.fetchRaffleDetails(this.raffle._id);
      } else {
        this.refreshSubscription?.unsubscribe();
      }
    });
  }

  addLiveUpdate(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.liveUpdates.unshift(`[${timestamp}] ${message}`);

    // Keep only last 10 updates
    if (this.liveUpdates.length > 10) {
      this.liveUpdates.pop();
    }
  }

  getTotalParticipants(): number {
    return this.raffle?.participants?.length || 0;
  }

  getTotalPrizeValue(): number {
    if (!this.raffle) return 0;
    return this.raffle.price * this.raffle.totalTicketsSold;
  }

  isUserWinner(): boolean {
    if (!this.winner || !this.currentUser) return false;

    // Handle both string ID and object cases
    const winnerId = typeof this.winner === 'string' ? this.winner : this.winner._id;
    return winnerId === this.currentUser._id;
  }

  goBack() {
    this.router.navigate(['/raffles']);
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
}
