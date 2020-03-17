import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	Input,
	ViewRef,
} from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';

declare var amplitude: any;

@Component({
	selector: 'bgs-hero-warband-stats',
	styleUrls: [
		`../../../../css/global/components-global.scss`,
		`../../../../css/component/battlegrounds/hero-selection/bgs-hero-warband-stats.component.scss`,
	],
	template: `
		<div class="container">
			<div style="display: block;">
				<canvas
					baseChart
					[style.width.px]="chartWidth"
					[style.height.px]="chartHeight"
					[datasets]="lineChartData"
					[labels]="lineChartLabels"
					[options]="lineChartOptions"
					[colors]="lineChartColors"
					[legend]="true"
					[chartType]="'line'"
				></canvas>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BgsHeroWarbandStatsComponent implements AfterViewInit {
	chartWidth: number;
	chartHeight: number;
	lineChartData: ChartDataSets[];
	lineChartLabels: Label[];
	lineChartOptions: ChartOptions = {
		responsive: true,
		scales: {
			// We use this empty structure as a placeholder for dynamic theming.
			xAxes: [{}],
			yAxes: [
				{
					id: 'delta-stats',
					position: 'left',
				},
			],
		},
	};
	lineChartColors: Color[] = [
		{
			backgroundColor: 'rgba(148,159,177,0.2)',
			borderColor: 'rgba(148,159,177,1)',
			pointBackgroundColor: 'rgba(148,159,177,1)',
			pointBorderColor: '#fff',
			pointHoverBackgroundColor: '#fff',
			pointHoverBorderColor: 'rgba(148,159,177,0.8)',
		},
	];

	@Input() set warbandStats(value: readonly { turn: number; totalStats: number }[]) {
		this.lineChartData = [{ data: value.map(stat => stat.totalStats), label: 'Warband stats delta' }];
		this.lineChartLabels = value.map(stat => '' + stat.turn);
	}

	constructor(private readonly el: ElementRef, private readonly cdr: ChangeDetectorRef) {}

	ngAfterViewInit() {
		const chartContainer = this.el.nativeElement.querySelector('.container');
		const rect = chartContainer.getBoundingClientRect();
		console.log('chartContainer', chartContainer, rect);
		this.chartWidth = rect.width;
		this.chartHeight = rect.width / 2;
		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}
}
