import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { MatchPredictorService } from '../services/match-predictor.service';

@Component({
  selector: 'app-match-predictor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectComponent,
  ],
  templateUrl: './match-predictor.component.html',
  styleUrl: './match-predictor.component.css'
})
export class MatchPredictorComponent implements OnInit {

  constructor(private matchPredictorService: MatchPredictorService) { }

  teams: { name: string, image: string }[] = [];
  filteredHomeTeams: { name: string, image: string }[] = [];
  filteredAwayTeams: { name: string, image: string }[] = [];
  selectedHomeTeam: { name: string } | undefined = undefined;
  selectedAwayTeam: { name: string } | undefined = undefined;

  loadingHome = false;
  loadingAway = false;
  loadingPredictions = false;

  homeWinPercentage: number = 0;
  awayWinPercentage: number = 0;
  drawPercentage: number = 0;
  homeExpectedGoals: number = 0;
  awayExpectedGoals: number = 0;

  labelHovered: 'home' | 'away' | null = null;
  dropdownOpen: 'home' | 'away' | null = null;
  ngOnInit() {
    this.teams = [
      { name: 'Arsenal', image: '/assets/arsenal.png' },
      { name: 'Aston Villa', image: '/assets/aston_villa.png' },
      { name: 'Bournemouth', image: '/assets/bournemouth.png' },
      { name: 'Brentford', image: '/assets/brentford.png' },
      { name: 'Brighton', image: '/assets/brighton.png' },
      { name: 'Chelsea', image: '/assets/chelsea.png' },
      { name: 'Crystal Palace', image: '/assets/crystal_palace.png' },
      { name: 'Everton', image: '/assets/everton.png' },
      { name: 'Fulham', image: '/assets/fulham.png' },
      { name: 'Ipswich Town', image: '/assets/ipswich_town.png' },
      { name: 'Leicester City', image: '/assets/leicester_city.png' },
      { name: 'Liverpool', image: '/assets/liverpool.png' },
      { name: 'Manchester City', image: '/assets/manchester_city.png' },
      { name: 'Manchester Utd', image: '/assets/manchester_united.png' },
      { name: 'Newcastle Utd', image: '/assets/newcastle_united.png' },
      { name: "Nott'ham Forest", image: '/assets/nottingham_forest.png' },
      { name: 'Southampton', image: '/assets/southampton.png' },
      { name: 'Tottenham', image: '/assets/tottenham.png' },
      { name: 'West Ham', image: '/assets/west_ham.png' },
      { name: 'Wolves', image: '/assets/wolves.png' },
    ];

    this.updateFilteredTeams();
  }

  updateFilteredTeams() {
    this.filteredHomeTeams = this.teams.filter(
      (team) => !this.selectedAwayTeam || team.name !== this.selectedAwayTeam.name
    );
    this.filteredAwayTeams = this.teams.filter(
      (team) => !this.selectedHomeTeam || team.name !== this.selectedHomeTeam.name
    );
  }

  getTeamImage(teamName: string | undefined): string {
    if (!teamName) {
      return '';
    }
    const team = this.teams.find((t) => t.name === teamName);
    return team ? team.image : '';
  }

  onTeamSelect(label: string) {
    if (label === 'home') {
      if (this.selectedHomeTeam) {
        this.loadingHome = true;
        setTimeout(() => {
          this.loadingHome = false;
        }, 2500);
      }
    } else if (label === 'away') {
      if (this.selectedAwayTeam) {
        this.loadingAway = true;
        setTimeout(() => {
          this.loadingAway = false;
        }, 2500);
      }
    }
    this.updateFilteredTeams();

    // Call the API if home and away team selected
    if (this.selectedHomeTeam && this.selectedAwayTeam) {
      this.loadingPredictions = true;

      this.matchPredictorService.getPredictions(this.selectedHomeTeam.name, this.selectedAwayTeam.name).subscribe(
        (response) => {
          setTimeout(() => {
            this.loadingPredictions = false;
            this.loadingHome = false;
            this.loadingAway = false;

            this.homeWinPercentage = parseFloat(response.home_win_probability.toFixed(2));
            this.drawPercentage = parseFloat(response.draw_probability.toFixed(2));
            this.awayWinPercentage = parseFloat(response.away_win_probability.toFixed(2));
            this.homeExpectedGoals = parseFloat(response.home_expected_goals.toFixed(2));
            this.awayExpectedGoals = parseFloat(response.away_expected_goals.toFixed(2));
          }, 1000);
        },
        (error) => {
          this.loadingPredictions = false;
          console.error('Error fetching predictions:', error);
          alert('An error occurred while fetching predictions. Please try again later.');
        }
      );
    }
  }

  onLabelHover(label: 'home' | 'away') {
    this.labelHovered = label;
  }

  onLabelLeave(label: 'home' | 'away') {
    this.labelHovered = null;
  }

  toggleDropdown(label: 'home' | 'away') {
    this.dropdownOpen = this.dropdownOpen === label ? null : label;
  }

  getDynamicColor(type: 'home' | 'away'): string {
    if (this.homeWinPercentage > this.awayWinPercentage) {
      return type === 'home' ? '#00A558' : '#E70000';
    } else if (this.awayWinPercentage > this.homeWinPercentage) {
      return type === 'away' ? '#00A558' : '#E70000';
    }
    return '#3D195B';
  }

  getGradient(): string {
    const homePercent = this.homeWinPercentage;
    const awayPercent = this.awayWinPercentage;

    if (homePercent === awayPercent) {
      return 'linear-gradient(to right, white 50%, white 50%)';
    }

    if (homePercent > awayPercent) {
      return 'linear-gradient(to right, #DFFFF0 10%, white 50%, #FFDDDD 90%)';
    } else {
      return 'linear-gradient(to right, #FFDDDD 10%, white 50%, #DFFFF0 90%)';
    }
  }
}
