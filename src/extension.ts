'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {RedConfiguration} from  './RedConfiguration';
import {redRunInConsole, redRunInGuiConsole, redCompileInConsole, redCompileInGuiConsole, setCommandMenu, redCompileInRelease, redCompileClear, redCompileUpdate} from './commandsProvider';
import * as vscodelc from 'vscode-languageclient';
import * as path from 'path';

let reddClient: vscodelc.LanguageClient;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let config = RedConfiguration.getInstance();

	context.subscriptions.push(vscode.commands.registerCommand("red.interpret", () => redRunInConsole()));
	context.subscriptions.push(vscode.commands.registerCommand("red.interpretGUI", () => redRunInGuiConsole()));
	context.subscriptions.push(vscode.commands.registerCommand("red.compile", () => redCompileInConsole()));
	context.subscriptions.push(vscode.commands.registerCommand("red.compileGUI", () => redCompileInGuiConsole()));
	context.subscriptions.push(vscode.commands.registerCommand("red.compileRelease", () => redCompileInRelease()));
	context.subscriptions.push(vscode.commands.registerCommand("red.clear", () => redCompileClear()));
	context.subscriptions.push(vscode.commands.registerCommand("red.update", () => redCompileUpdate()));
	context.subscriptions.push(vscode.commands.registerCommand("red.commandMenu", setCommandMenu));
	console.log("isIntelligence", config.isIntelligence);
	if (!config.isIntelligence) {return;}

	console.log("Red console path: ", config.redConsole);
	let serverModule = path.join(context.asAbsolutePath("."), "server", "server.red");
	let needlog = "debug-off";
	if (config.needRlsDebug) {
		needlog = "debug-on";
	}
	console.log(needlog);
	const serverOptions: vscodelc.ServerOptions = {
		run : { command: config.redConsole, args: [serverModule, needlog]},
		debug: { command: config.redConsole, args: [serverModule, "debug-on"] }
	};
	const clientOptions: vscodelc.LanguageClientOptions = {
		documentSelector: [
			{scheme: 'file', language: 'red'},
			{scheme: 'file', language: 'reds'}
		],
		initializationOptions: config.allConfigs || {},
		synchronize: {
			configurationSection: ['red', 'reds']
		}
	};
	reddClient = new vscodelc.LanguageClient('red.server', 'Red Language Server', serverOptions, clientOptions);
	console.log('Red Language Server is now active!');
	context.subscriptions.push(reddClient.start());
}

// this method is called when your extension is deactivated
export function deactivate(): Thenable<void> | undefined {
	if (!reddClient) {
		return undefined;
	}
	return reddClient.stop();
}