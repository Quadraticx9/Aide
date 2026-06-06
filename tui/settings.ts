import { select, isCancel, text } from "@clack/prompts";
import chalk from "chalk";
import figlet from "figlet";
import fs from "fs";
import path from "path";

const BANNER_FONT = "graffiti";
const SHADOW = chalk.hex('#ff0000');
const FACE = chalk.hex('#ffffff').bold;

function printBannerWithShadow(ascii: string) {
    const bannerLines = ascii.replace(/\s+$/, '').split('\n');
    const maxLen = Math.max(...bannerLines.map((l) => l.length), 0);
    const rowWidth = maxLen + 2;

    for (const line of bannerLines) {
        console.log(SHADOW(('  ' + line).padEnd(rowWidth)));
    }
    process.stdout.write(`\x1b[${bannerLines.length}A`);
    for (const line of bannerLines) {
        console.log(FACE(line.padEnd(rowWidth)));
    }
    console.log();
}

export async function settings() {
    let ascii: string;
    try {
        ascii = figlet.textSync("sidekick", { font: BANNER_FONT });
    } catch (error) {
        ascii = figlet.textSync("sidekick", { font: "Standard" });
    }

    printBannerWithShadow(ascii);

    const mode = await select({
        message: "Which mode you want to proceed with?",
        options: [
            { value: "openrouter-key", label: "OpenRouter Key" },
            { value: "exit", label: "Exit" }
        ]
    });

    if (isCancel(mode) || mode === "exit") {
        console.log(chalk.dim('\n Goodbye. \n'));
        return;
    }

    if (mode === "openrouter-key") {
        const goal = await text({
            message: "Enter your OpenRouter API key to proceed:",
            placeholder: "OpenRouter's API key for this codebase…",
        });

        if (isCancel(goal)) {
            console.log(chalk.dim('\n Operation cancelled. \n'));
            return;
        }

        if (goal === "$secret$") {
            console.log(chalk.red("\nThis is only for Owner or Admins\n"));
            const goal = await text({
                message: "Secret:",
                placeholder: "Enter secret by owner or admin…",
            });
            return;
        }

        const envPath = path.resolve(process.cwd(), '.env');
        const keyName = 'OPENROUTER_API_KEY';
        const newEntry = `${keyName}=${goal}`;

        try {
            let envContent = '';

            // 1. Check if .env file already exists
            if (fs.existsSync(envPath)) {
                envContent = fs.readFileSync(envPath, 'utf8');

                // 2. Check if the key already exists in the file
                const regex = new RegExp(`^${keyName}=.*$`, 'm');
                if (regex.test(envContent)) {
                    // If it exists, update the line
                    envContent = envContent.replace(regex, newEntry);
                } else {
                    // If it doesn't exist, append it to the bottom
                    envContent += `\n${newEntry}`;
                }
            } else {
                // 3. If .env doesn't exist at all, create it
                envContent = newEntry;
            }

            // 4. Write the content back to the file
            fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
            console.log(chalk.green('\n✅ OpenRouter API key saved successfully!\n'));

            // Optional: If your app uses 'dotenv' and you need to use the key 
            // immediately in this same process, reload it:
            // import dotenv from 'dotenv';
            // dotenv.config({ override: true });

        } catch (error) {
            console.error(chalk.red('\n❌ Failed to save API key to .env file.\n'), error);
        }
    }
}