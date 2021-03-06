/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('@artonge/webpack');
// const ngcWebpack = require("ngc-webpack");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
const AngularCompilerPlugin = webpack.AngularCompilerPlugin;
const DefinePlugin = require('webpack').DefinePlugin;
const BannerPlugin = require('webpack').BannerPlugin;
// const SentryWebpackPlugin = require('@sentry/webpack-plugin');
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

var path = require('path');

var _root = path.resolve(__dirname, '.');

function getRoot(args) {
	args = Array.prototype.slice.call(arguments, 0);
	return path.join.apply(path, [_root].concat(args));
}

const entry = {
	// Keep polyfills at the top so that it's imported first in the HTML
	polyfills: './src/polyfills.ts',
	background: './src/js/modules/background/main.ts',
	collection: './src/js/modules/collection/main.ts',
	loading: './src/js/modules/loading/main.ts',
	notifications: './src/js/modules/notifications/main.ts',
	decktracker: './src/js/modules/decktracker/main.ts',
	decktrackeropponent: './src/js/modules/decktracker-opponent/main.ts',
	secretshelper: './src/js/modules/secrets-helper/main.ts',
	gamecounters: './src/js/modules/game-counters/main.ts',
	opponentHand: './src/js/modules/opponent-hand/main.ts',
	settings: './src/js/modules/settings/main.ts',
	twitchauthcallback: './src/js/modules/twitch-auth-callback/main.ts',
	battlegrounds: './src/js/modules/battlegrounds/main.ts',
	bgsbattlesimulation: './src/js/modules/bgs-battle-simulation/main.ts',
	bgsbannedtribes: './src/js/modules/bgs-banned-tribes/main.ts',
	'bgsbattlesimulation.worker': './src/js/workers/bgs-simulation.worker.ts',
	'bgspostmatchstats.worker': './src/js/workers/bgs-post-match-stats.worker.ts',
};

module.exports = function(env, argv) {
	const plugins = [
		// Define environment variables to export to Angular
		new DefinePlugin({
			'process.env.APP_VERSION': JSON.stringify(env.appversion),
			'process.env.LOCAL_TEST': env.localTest,
		}),

		new AngularCompilerPlugin({
			tsConfigPath: './tsconfig.json',
			entryModules: [
				'./src/js/modules/background/background.module#AppModule',
				'./src/js/modules/collection/collection.module#CollectionModule',
				'./src/js/modules/loading/loading.module#LoadingModule',
				'./src/js/modules/notifications/notifications.module#NotificationsModule',
				'./src/js/modules/decktracker/decktracker.module#DeckTrackerModule',
				'./src/js/modules/decktracker-opponent/decktracker-opponent.module#DeckTrackerOpponentModule',
				'./src/js/modules/secrets-helper/secrets-helper.module#SecretsHelperModule',
				'./src/js/modules/opponent-hand/opponent-hand-overlay.module#OpponentHandOverlayModule',
				'./src/js/modules/settings/settings.module#SettingsModule',
				'./src/js/modules/twitch-auth-callback/twitch-auth-callback.module#TwitchAuthCallbackModule',
				'./src/js/modules/battlegrounds/battlegrounds.module#BattlegroundsModule',
				'./src/js/modules/bgs-battle-simulation/bgs-battle-simulation.module#BgsBattleSimulationModule',
				'./src/js/modules/game-counters/game-counters.module#GameCountersModule',
				'./src/js/modules/bgs-banned-tribes/bgs-banned-tribes.module#BgsBannedTribesModule',
			],
			sourceMap: true,
		}),

		new BannerPlugin({
			banner: `var window = self;importScripts("./vendor.js");`,
			raw: true,
			entryOnly: true,
			test: /bgsbattlesimulationworker/,
		}),
		new BannerPlugin({
			banner: `var window = self;importScripts("./vendor.js");`,
			raw: true,
			entryOnly: true,
			test: /bgspostmatchstatsworker/,
		}),

		new MiniCssExtractPlugin({
			filename: 'app.css',
		}),

		new CopyWebpackPlugin([
			{ from: path.join(process.cwd(), 'src/assets'), to: 'assets', ignore: ['**/twitch*/*'] },
			// { from: path.join(process.cwd(), 'dependencies/cards.json') },
			{ from: path.join(process.cwd(), 'dependencies/coliseum.js') },
			{ from: path.join(process.cwd(), 'plugins'), to: 'plugins' },
			{ from: path.join(process.cwd(), 'dependencies/achievements'), to: 'achievements' },
			// All the OW stuff, like manifest.json
			{ from: path.join(process.cwd(), 'overwolf/*'), to: '..', flatten: true },
		]),

		buildHtmlWebpackPluginConf('background.html', 'background'),
		buildHtmlWebpackPluginConf('collection.html', 'collection'),
		buildHtmlWebpackPluginConf('loading.html', 'loading'),
		buildHtmlWebpackPluginConf('notifications.html', 'notifications'),
		buildHtmlWebpackPluginConf('decktracker.html', 'decktracker'),
		buildHtmlWebpackPluginConf('decktracker_opponent.html', 'decktrackeropponent'),
		buildHtmlWebpackPluginConf('secrets_helper.html', 'secretshelper'),
		buildHtmlWebpackPluginConf('settings.html', 'settings'),
		buildHtmlWebpackPluginConf('twitch-auth-callback.html', 'twitchauthcallback'),
		buildHtmlWebpackPluginConf('match_overlay_opponent_hand.html', 'opponentHand'),
		buildHtmlWebpackPluginConf('battlegrounds.html', 'battlegrounds'),
		buildHtmlWebpackPluginConf('bgs_battle_simulation.html', 'bgsbattlesimulation'),
		buildHtmlWebpackPluginConf('bgs_banned_tribes.html', 'bgsbannedtribes'),
		buildHtmlWebpackPluginConf('counter_player_galakrond.html', 'gamecounters'),
		buildHtmlWebpackPluginConf('counter_opponent_galakrond.html', 'gamecounters'),
		buildHtmlWebpackPluginConf('counter_player_pogo.html', 'gamecounters'),
		buildHtmlWebpackPluginConf('counter_opponent_pogo.html', 'gamecounters'),
		buildHtmlWebpackPluginConf('counter_player_jade_golem.html', 'gamecounters'),
		buildHtmlWebpackPluginConf('counter_opponent_jade_golem.html', 'gamecounters'),
		buildHtmlWebpackPluginConf('counter_player_cthun.html', 'gamecounters'),
		buildHtmlWebpackPluginConf('counter_opponent_cthun.html', 'gamecounters'),
		buildHtmlWebpackPluginConf('counter_player_fatigue.html', 'gamecounters'),
		buildHtmlWebpackPluginConf('counter_opponent_fatigue.html', 'gamecounters'),
		buildHtmlWebpackPluginConf('counter_player_attack.html', 'gamecounters'),
		buildHtmlWebpackPluginConf('counter_opponent_attack.html', 'gamecounters'),
		buildHtmlWebpackPluginConf('bgs_counter_player_pogo.html', 'gamecounters'),

		// Replace the version in the manifest
		new ReplaceInFileWebpackPlugin([
			{
				dir: 'dist',
				files: ['manifest.json'],
				rules: [
					{
						search: '@app-version@',
						replace: env.appversion,
					},
				],
			},
		]),
		// Automatically update the version in sentry.properties
		new ReplaceInFileWebpackPlugin([
			{
				dir: '.',
				files: ['sentry.properties'],
				rules: [
					{
						search: '@app-version@',
						replace: env.appversion,
					},
				],
			},
		]),
		// new BundleAnalyzerPlugin(),
	];

	return {
		mode: env.production ? 'production' : 'development',
		entry: entry,

		// https://hackernoon.com/the-100-correct-way-to-split-your-chunks-with-webpack-f8a9df5b7758
		optimization: env.production
			? {
					runtimeChunk: 'single',
					minimize: true,
					minimizer: [
						new TerserPlugin({
							cache: true,
							parallel: true,
							sourceMap: true, // Must be set to true if using source-maps in production
							terserOptions: {
								mangle: false,
								keep_classnames: true,
								keep_fnames: true,
							},
						}),
					],
					namedModules: true,
					namedChunks: true,
					splitChunks: {
						chunks: 'all',
						maxInitialRequests: Infinity,
						minSize: 1 * 1000, // Don't split the really small chunks
						cacheGroups: {
							vendor: {
								test: /node_modules/,
								chunks: 'initial',
								name: 'vendor',
								priority: 10,
								enforce: true,
							},
						},
					},
			  }
			: {
					runtimeChunk: 'single',
					splitChunks: {
						chunks: 'all',
						maxInitialRequests: Infinity,
						minSize: 1 * 1000, // Don't split the really small chunks
						cacheGroups: {
							vendor: {
								test: /node_modules/,
								chunks: 'initial',
								name: 'vendor',
								priority: 10,
								enforce: true,
							},
						},
					},
			  },

		target: 'web',

		devtool: env.production ? false : 'inline-source-map',

		// Doesn't work, for some reason the code loaded after refresh is still the old one
		watch: false,

		watchOptions: {
			ignored: ['node_modules', 'test', 'dependencies'],
		},

		output: {
			path: getRoot('dist/Files'),
			publicPath: './',
			filename: '[name].js',
		},

		resolve: {
			// Having ts before js is important for webpack watch to work
			// However, angular2-indexeddb creates an issue (ts files are packaged alongside js), so
			// you need to remove the .ts files from its node_modules folder
			// See https://github.com/gilf/angular2-indexeddb/issues/67
			extensions: ['.ts', '.js', '.html'],
		},

		module: {
			rules: [
				{
					test: /\.ts$/,
					exclude: [/node_modules/, /test/, /\.worker.ts$/],
					use: ['@artonge/webpack', 'ts-loader'],
				},
				{
					test: /\.worker.ts$/,
					exclude: [/node_modules/, /test/],
					use: ['ts-loader'],
				},
				{
					test: /\.scss$/,
					exclude: /node_modules/,
					use: ['css-to-string-loader', 'css-loader', 'sass-loader'],
				},
				{
					test: /\.worker\.js$/,
					use: { loader: 'worker-loader' },
				},
			],
		},

		plugins: plugins,
	};
};

const buildHtmlWebpackPluginConf = (filename, chunkName) => {
	// Exclude the other modules. This will still import all the other chunks,
	// thus probably importing some unrelated stuff, but they should be
	// small enough that it should not matter (and we're serving them from
	// the local filesystem, so in the end it doesn't really matter)
	const excludedChunks = Object.keys(entry)
		.filter(chunk => chunk !== chunkName)
		.filter(chunk => chunk !== 'polyfills');
	return new HtmlWebpackPlugin({
		filename: filename,
		template: `src/html/${filename}`,
		excludeChunks: excludedChunks,
		chunksSortMode: 'manual',
	});
};
