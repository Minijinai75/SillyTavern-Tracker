//#region Setting Enums

export const generationModes = {
	INLINE: "inline",
	SINGLE_STAGE: "single-stage",
	TWO_STAGE: "two-stage",
};

export const generationTargets = {
	BOTH: "both",
	USER: "user",
	CHARACTER: "character",
	NONE: "none",
};

export const trackerFormat = {
	JSON: "JSON",
	YAML: "YAML",
};

export const PREVIEW_PLACEMENT = {
	BEFORE: "before",
	AFTER: "after",
	APPEND: "append",
	PREPEND: "prepend",
};

//#endregion

//#region Two Stage

const twoStageGenerateContextTemplate = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{{trackerSystemPrompt}}\n\n<!-- Start of Context -->\n\n{{characterDescriptions}}\n\n### Example Trackers\n<!-- Start of Example Trackers -->\n{{trackerExamples}}\n<!-- End of Example Trackers -->\n\n### Current Tracker\n<tracker>\n{{currentTracker}}\n</tracker>\n\n### Changes List\n{{firstStageMessage}}\n\n<!-- End of Context --><|eot_id|>`;
const twoStageGenerateSystemPrompt = `You are a Scene Tracker Assistant, tasked with providing clear, consistent, and structured updates to a scene tracker for a roleplay. Use the provided changes list, previous tracker details, and recent context to accurately update the tracker. Your response must follow the specified {{trackerFormat}} structure exactly, ensuring that each field is filled and complete.\n\n### Key Instructions:\n1. **Tracker Format**: Always respond with a complete tracker in {{trackerFormat}} format. Every field must be present in the response, even if unchanged. Do not omit fields or change the {{trackerFormat}} structure.\n2. **Incorporate Changes List**:\n   - Use the provided changes list to guide updates. Do not infer additional changes beyond what is explicitly listed unless required to ensure consistency.\n   - If specific information is missing, rely on prior descriptions, logical inferences, or default details.\n3. **Default Assumptions for Missing Information**: \n   - **Character Details**: If no new details are provided for a character, assume reasonable defaults based on previous entries or context.\n   - **Outfit**: Include complete outfit details for each character, specifying underwear explicitly. If the character is undressed, list all clothing items, including their placement.\n   - **StateOfDress**: Describe how put-together or disheveled the character appears, reflecting any updates in the changes list.\n4. **Incremental Time Progression**: \n   - Adjust time incrementally based on the changes list, typically only a few seconds per update unless otherwise specified.\n   - Format the time as "HH:MM:SS; MM/DD/YYYY (Day Name)".\n5. **Context-Appropriate Times**: \n   - Ensure the time aligns with the scene's setting and context (e.g., operating hours for public venues).\n6. **Location Format**: Use specific, detailed locations relevant to the context, avoiding unintended reuse of previous examples.\n7. **Consistency**: Maintain {{trackerFormat}} structure precisely. If no changes occur in a field, retain the most recent value.\n8. **Topics Format**: Ensure topics are concise and relevant to the scene (e.g., one- or two-word keywords).\n9. **Avoid Redundancies**: Only include details provided or logically inferred. Avoid speculative or unnecessary additions.\n\n### Tracker Template\nReturn your response in the following {{trackerFormat}} structure, following this format precisely:\n\n\`\`\`\n<tracker>\n{{defaultTracker}}\n</tracker>\n\`\`\`\n\n### Important Reminders:\n1. **Changes List**: Use the provided changes list to guide updates to the tracker. Do not detect additional changes beyond what is explicitly stated.\n2. **Recent Messages and Current Tracker**: Consider the recent messages and the current tracker to ensure accuracy and context alignment.\n3. **Structured Response**: Respond with the full tracker in {{trackerFormat}}. Do not add extra information outside of the tracker structure.\n4. **Complete Entries**: Always provide the full tracker, even if the changes are minor or limited to a single field.\n\nYour primary objective is to ensure clarity, consistency, and structured updates for scene tracking in {{trackerFormat}} format, accurately reflecting the provided changes.`;
const twoStageGenerateRequestPrompt = `[Use the provided changes list below to update the current scene tracker based on explicit details. Do not infer additional changes beyond those listed. Pause and ensure only the tracked data is provided, formatted in {{trackerFormat}}. Avoid adding, omitting, or rearranging fields unless specified. Respond with the full tracker every time.\n\n### Changes List:\n{{firstStageMessage}}\n\n### Response Rules:\n{{trackerFieldPrompt}}\n\nEnsure the response remains consistent, strictly follows this structure in {{trackerFormat}}, and omits any extra data or deviations. You MUST enclose the tracker in <tracker></tracker> tags.]`;

const messageSummarizationContextTemplate = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{{messageSummarizationSystemPrompt}}\n\n<!-- Start of Context -->\n\n### Current Tracker\n<tracker>\n{{currentTracker}}\n</tracker>\n\n### Recent Messages\n{{recentMessages}}\n\n### Tracker Field Guidelines\n{{trackerFieldPrompt}}\n\n<!-- End of Context -->\n<|eot_id|>`;
const messageSummarizationSystemPrompt = `You are a Scene Change Detector. Your task is to analyze the latest message and identify all relevant changes or updates for a scene tracker.\n\n### Instructions:\n1. **Detect Changes**:\n   - Compare the latest message to the recent context and identify explicit or logical updates based on the described actions, emotions, and scene details.\n   - Focus on changes that affect the scene tracker, prioritizing the types of updates outlined in the **Tracker Field Guidelines** provided in the context.\n\n2. **Output Format**:\n   - Provide a **markdown list** describing each identified change.\n   - Each entry must be concise, specific, and written in plain language.\n   - Avoid speculative updates or unrelated information. If no changes are detected, respond with:\n   \`\`\`\n   - No changes identified.\n   \`\`\`\n\n3. **General Handling**:\n   - Use the latest message and recent context to determine updates. Focus on elements such as:\n     - {{trackerFieldPrompt}} (Defined dynamically in the context).\n   - Include specific updates to characters, actions, time, emotional tone, location, or any other field defined in the tracker format.\n\n4. **Example Output**:\n   \`\`\`\n   - The time has advanced by a few seconds.\n   - Cohee is leading Kaldigo through the mall, pointing out stores and holding his hand.\n   - Cohee's tone is excited, reflecting her playful dialogue and energetic gestures.\n   \`\`\`\n\nYour goal is to provide a concise and accurate list of changes that will inform updates to the scene tracker.`;
const messageSummarizationRequestPrompt = `Analyze the most recent message provided below and compare it to the recent context and tracker to identify changes. Your response must follow the rules provided and use the specified **markdown list** format.\n\n### Recent Message:\n{{message}}\n\n### Response Rules:\n1. Compare the recent message to the current tracker and context to detect changes.\n2. Focus on changes related to the fields outlined in {{trackerFieldPrompt}}, such as time, location, characters, or other context-specific updates.\n3. List all detected changes in markdown list format. Avoid any additional formatting.\n4. Use concise and specific language. Base updates only on explicit or inferred details.\n\n### Output Format:\n\`\`\`\n- The time has advanced by a few seconds.\n- Cohee is leading Kaldigo through the mall, pointing out stores and holding his hand.\n- Cohee's tone is excited, reflecting her playful dialogue and energetic gestures.\n\`\`\`\n\nProvide only the list of changes as your response.`;
const messageSummarizationRecentMessagesTemplate = `{{char}}: {{message}}`;

//#endregion

//#region Inline

const inlineRequestPrompt = `[At the beginning of every response, prepend an updated tracker to reflect the current scene. Use the provided tracker format, field guidelines, and default structure to ensure consistency and accuracy.\n\n### Instructions:\n1. **Tracker Updates**:\n   - Update the tracker fields based on the latest message and logical inferences using:\n     - The provided tracker field guidelines.\n     - The current tracker as the base for continuity.\n     - Logical assumptions if explicit details are missing, informed by prior context.\n2. **Time Progression**:\n   - Progress time incrementally unless a time skip is explicitly indicated (e.g., sleeping, traveling, or user requests).\n3. **Weather Updates**:\n   - Update or infer weather conditions based on the setting, time, and scene location.\n4. **Tracker Format**:\n   - Use the exact tracker structure provided in the default tracker template.\n   - Ensure all fields are present and complete, even if unchanged.\n\n### Tracker Format:\n<tracker>\n{{defaultTracker}}\n</tracker>\n\n### Tracker Guidelines:\n{{trackerFieldPrompt}}\n\nEnsure every response starts with a tracker in the specified format, followed by the regular message content.]`;

//#endregion

//#region Shared

const generateContextTemplate = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{{trackerSystemPrompt}}\n\n<!-- Start of Context -->\n\n{{characterDescriptions}}\n\n### Example Trackers\n<!-- Start of Example Trackers -->\n{{trackerExamples}}\n<!-- End of Example Trackers -->\n\n### Recent Messages with Trackers\n{{recentMessages}}\n\n### Current Tracker\n<tracker>\n{{currentTracker}}\n</tracker>\n\n<!-- End of Context --><|eot_id|>`;
const generateSystemPrompt = `You are a Scene Tracker Assistant, tasked with providing clear, consistent, and structured updates to a scene tracker for a roleplay. Use the latest message, previous tracker details, and context from recent messages to accurately update the tracker. Your response must follow the specified {{trackerFormat}} structure exactly, ensuring that each field is filled and complete. If specific information is not provided, make reasonable assumptions based on prior descriptions, logical inferences, or default character details.\n\n### Key Instructions:\n1. **Tracker Format**: Always respond with a complete tracker in {{trackerFormat}} format. Every field must be present in the response, even if unchanged. Do not omit fields or change the {{trackerFormat}} structure.\n2. **Default Assumptions for Missing Information**: \n   - **Character Details**: If no new details are provided for a character, assume reasonable defaults (e.g., hairstyle, posture, or attire based on previous entries or context).\n   - **Outfit**: Describe the complete outfit for each character, using specific details for color, fabric, and style (e.g., "fitted black leather jacket with silver studs on the collar"). **Underwear must always be included in the outfit description.** If underwear is intentionally missing, specify this clearly in the description (e.g., "No bra", "No panties"). If the character is undressed, list the entire outfit.\n   - **StateOfDress**: Describe how put-together or disheveled the character appears, including any removed clothing. If the character is undressed, indicate where discarded items are placed.\n3. **Incremental Time Progression**: \n   - Adjust time in small increments, ideally only a few seconds per update, to reflect realistic scene progression. Avoid large jumps unless a significant time skip (e.g., sleep, travel) is explicitly stated.\n   - Format the time as "HH:MM:SS; MM/DD/YYYY (Day Name)".\n4. **Context-Appropriate Times**: \n   - Ensure that the time aligns with the setting. For example, if the scene takes place in a public venue (e.g., a mall), choose an appropriate time within standard operating hours.\n5. **Location Format**: Avoid unintended reuse of specific locations from previous examples or responses. Provide specific, relevant, and detailed locations based on the context, using the format:\n   - **Example**: "Food court, second floor near east wing entrance, Madison Square Mall, Los Angeles, CA" \n6. **Consistency**: Match field structures precisely, maintaining {{trackerFormat}} syntax. If no changes occur in a field, keep the most recent value.\n7. **Topics Format**: Ensure topics are one- or two-word keywords relevant to the scene to help trigger contextual information. Avoid long phrases.\n8. **Avoid Redundancies**: Use only details provided or logically inferred from context. Do not introduce speculative or unnecessary information.\n9. **Focus and Pause**: Treat each scene update as a standalone, complete entry. Respond with the full tracker every time, even if there are only minor updates.\n\n### Tracker Template\nReturn your response in the following {{trackerFormat}} structure, following this format precisely:\n\n\`\`\`\n<tracker>\n{{defaultTracker}}\n</tracker>\n\`\`\`\n\n### Important Reminders:\n1. **Recent Messages and Current Tracker**: Before updating, always consider the recent messages and the provided <Current Tracker> to ensure all changes are accurately represented.\n2. **Structured Response**: Do not add any extra information outside of the {{trackerFormat}} tracker structure.\n3. **Complete Entries**: Always provide the full tracker in {{trackerFormat}}, even if only minor updates are made.\n\nYour primary objective is to ensure clarity, consistency, and structured responses for scene tracking in {{trackerFormat}} format, providing complete details even when specifics are not explicitly stated.`;
const generateRequestPrompt = `[Analyze the previous message along with the recent messages provided below and update the current scene tracker based on logical inferences and explicit details. Pause and ensure only the tracked data is provided, formatted in {{trackerFormat}}. Avoid adding, omitting, or rearranging fields unless specified. Respond with the full tracker every time.\n\n### Response Rules:\n{{trackerFieldPrompt}}\n\nEnsure the response remains consistent, strictly follows this structure in {{trackerFormat}}, and omits any extra data or deviations. You MUST enclose the tracker in <tracker></tracker> tags]`;
const generateRecentMessagesTemplate = `{{#if tracker}}Tracker: <tracker>\n{{tracker}}\n</tracker>\n{{/if}}{{char}}: {{message}}`;

const characterDescriptionTemplate = `### {{char}}'s Description\n{{charDescription}}`;

const mesTrackerTemplate = `<div class="tracker_default_mes_template">
    <table>
        <tr>
            <td>時間：</td>
            <td>{{時間}}</td>
        </tr>
        <tr>
            <td>地點：</td>
            <td>{{地點}}</td>
        </tr>
        <tr>
            <td>天氣：</td>
            <td>{{天氣}}</td>
        </tr>
    </table>
    <details>
        <summary><span>追蹤器詳細</span></summary>
        <table>
            <tr>
                <td>主題：</td>
                <td>{{#join "; " 主題群}}</td>
            </tr>
            <tr>
                <td>在場：</td>
                <td>{{#join "; " 在場角色}}</td>
            </tr>
        </table>
        <div class="mes_tracker_characters">
            {{#foreach 角色 character}}
            <hr>
            <strong>{{character}}:</strong><br />
            <table>
                <tr>
                    <td>髮型：</td>
                    <td>{{character.髮型}}</td>
                </tr>
                <tr>
                    <td>妝容：</td>
                    <td>{{character.妝容}}</td>
                </tr>
                <tr>
                    <td>服裝：</td>
                    <td>{{character.服裝}}</td>
                </tr>
                <tr>
                    <td>狀態：</td>
                    <td>{{character.穿著狀態}}</td>
                </tr>
                <tr>
                    <td>姿勢：</td>
                    <td>{{character.姿勢與互動}}</td>
                </tr>
            </table>
            {{/foreach}}
        </div>
    </details>
</div>
<hr>`;

const mesTrackerJavascript = `() => {
    const helloWorld = (mesId, element) => {
        console.log({message: "Hello, World!", mesId, element});
    };

    const init = () => {
        console.log("Tracker preview js initialized!");

		// Example of hooking into tracker preview added call
		// SillyTavern.getContext().eventSource.on("TRACKER_PREVIEW_ADDED", helloWorld)

		// Example of hooking into tracker preview updated call
		// SillyTavern.getContext().eventSource.on("TRACKER_PREVIEW_UPDATED", helloWorld)
    };
	
    const cleanup = () => {
        console.log("Tracker preview js cleaned up!");
		// Example of releasing tracker preview calls
		// SillyTavern.getContext().eventSource.off("TRACKER_PREVIEW_ADDED")
		// SillyTavern.getContext().eventSource.off("TRACKER_PREVIEW_UPDATED")
    };

    return {
		init,
		cleanup,
        helloWorld
    };
}`;

const trackerDef = {
	"field-0": {
		name: "時間",
		type: "STRING",
		presence: "DYNAMIC",
		prompt: 'Adjust the time in **small increments**, ideally only a few seconds per update, to reflect natural progression, avoiding large jumps unless explicitly indicated (e.g., sleep, travel). Ensure that the time is appropriate for the setting (e.g., malls are typically open during certain hours). Use the 24-hour format: "HH:MM:SS; MM/DD/YYYY (Day Name)".',
		defaultValue: "<時間有變化時更新>",
		exampleValues: ["09:15:30; 10/16/2024 (Wednesday)", "18:45:50; 10/16/2024 (Wednesday)", "15:10:20; 10/16/2024 (Wednesday)"],
		nestedFields: {},
	},
	"field-1": {
		name: "地點",
		type: "STRING",
		presence: "DYNAMIC",
		prompt: 'Provide a **detailed and specific location**, including exact places like rooms, landmarks, or stores, following this format: "Specific Place, Building, City, State". Avoid unintended reuse of specific locations from previous examples. Example: "Food court, second floor near east wing entrance, Madison Square Mall, Los Angeles, CA".',
		defaultValue: "<地點有變化時更新>",
		exampleValues: ["Conference Room B, 12th Floor, Apex Corporation, New York, NY", "Main Gym Hall, Maple Street Fitness Center, Denver, CO", "South Beach, Miami, FL"],
		nestedFields: {},
	},
	"field-2": {
		name: "天氣",
		type: "STRING",
		presence: "DYNAMIC",
		prompt: 'Describe current weather concisely to set the scene. Example: "Light Drizzle, Cool Outside".',
		defaultValue: "<天氣有變化時更新>",
		exampleValues: ["Overcast, mild temperature", "Clear skies, warm evening", "Sunny, gentle sea breeze"],
		nestedFields: {},
	},
	"field-3": {
		name: "主題群",
		type: "ARRAY_OBJECT",
		presence: "DYNAMIC",
		prompt: "",
		defaultValue: "",
		exampleValues: ["", "", ""],
		nestedFields: {
			"field-4": {
				name: "主要主題",
				type: "STRING",
				presence: "DYNAMIC",
				prompt: "**One- or two-word topic** describing main activity or focus of the scene.",
				defaultValue: "<主要主題有變化時更新>",
				exampleValues: ["Presentation", "Workout", "Relaxation"],
				nestedFields: {},
			},
			"field-5": {
				name: "情緒氛圍",
				type: "STRING",
				presence: "DYNAMIC",
				prompt: "**One- or two-word topic** describing dominant emotional atmosphere of the scene.",
				defaultValue: "<情緒氛圍有變化時更新>",
				exampleValues: ["Tense", "Focused", "Calm"],
				nestedFields: {},
			},
			"field-6": {
				name: "互動主題",
				type: "STRING",
				presence: "DYNAMIC",
				prompt: "**One- or two-word topic** describing primary type of interactions or relationships in the scene.",
				defaultValue: "<互動主題有變化時更新>",
				exampleValues: ["Professional", "Supportive", "Casual"],
				nestedFields: {},
			},
		},
	},
	"field-7": {
		name: "在場角色",
		type: "ARRAY",
		presence: "DYNAMIC",
		prompt: "List all characters currently present in an array format.",
		defaultValue: "<在場角色有變化時更新>",
		exampleValues: ['["Emma Thompson", "James Miller", "Sophia Rodriguez"]', '["Daniel Lee", "Olivia Harris"]', '["Liam Johnson", "Emily Clark"]'],
		nestedFields: {},
	},
	"field-8": {
		name: "角色",
		type: "FOR_EACH_OBJECT",
		presence: "DYNAMIC",
		prompt: "For each character, update the following details:",
		defaultValue: "<角色名稱>",
		exampleValues: ['["Emma Thompson", "James Miller", "Sophia Rodriguez"]', '["Daniel Lee", "Olivia Harris"]', '["Liam Johnson", "Emily Clark"]'],
		nestedFields: {
			"field-9": {
				name: "髮型",
				type: "STRING",
				presence: "DYNAMIC",
				prompt: "Describe style only.",
				defaultValue: "<髮型有變化時更新>",
				exampleValues: ['["Shoulder-length blonde hair, styled straight", "Short black hair, neatly combed", "Long curly brown hair, pulled back into a low bun"]', '["Short brown hair, damp with sweat", "Medium-length red hair, tied up in a high ponytail"]', '["Short sandy blonde hair, slightly tousled", "Long wavy brown hair, loose and flowing"]'],
				nestedFields: {},
			},
			"field-10": {
				name: "妝容",
				type: "STRING",
				presence: "DYNAMIC",
				prompt: "Describe current makeup.",
				defaultValue: "<妝容有變化時更新>",
				exampleValues: ['["Natural look with light foundation and mascara", "None", "Subtle eyeliner and nude lipstick"]', '["None", "Minimal, sweat-resistant mascara"]', '["None", "Sunscreen applied, no additional makeup"]'],
				nestedFields: {},
			},
			"field-11": {
				name: "服裝",
				type: "STRING",
				presence: "DYNAMIC",
				prompt: '**IMPORTANT!** List the complete outfit, including **underwear and accessories**, even if the character is undressed. **Underwear must always be included in the outfit description. If underwear is intentionally missing, specify this clearly (e.g. "No Bra", "No Panties").** Outfit should stay the same until changed for a new one.',
				defaultValue: "<完整服裝描述，即使脫掉也要列出，包含顏色、材質和風格；**務必包含內衣和配件，若故意不穿請明確說明**>",
				exampleValues: [
					'["Navy blue blazer over a white silk blouse; Gray pencil skirt; Black leather belt; Sheer black stockings; Black leather pumps; Pearl necklace; Silver wristwatch; White lace balconette bra; White lace hipster panties matching the bra", "Dark gray suit; Light blue dress shirt; Navy tie with silver stripes; Black leather belt; Black dress shoes; Black socks; White cotton crew-neck undershirt; Black cotton boxer briefs", "Cream-colored blouse with ruffled collar; Black slacks; Brown leather belt; Brown ankle boots; Gold hoop earrings; Beige satin push-up bra; Beige satin bikini panties matching the bra"]',
					'["Gray moisture-wicking t-shirt; Black athletic shorts; White ankle socks; Gray running shoes; Black sports watch; Blue compression boxer briefs", "Black sports tank top; Purple athletic leggings; Black athletic sneakers; White ankle socks; Fitness tracker bracelet; Black racerback sports bra; Black seamless athletic bikini briefs matching the bra"]',
					'["Light blue short-sleeve shirt; Khaki shorts; Brown leather sandals; Silver wristwatch; Blue plaid cotton boxer shorts", "White sundress over a red halter bikini; Straw hat; Brown flip-flops; Gold anklet; Red halter bikini top; Red tie-side bikini bottoms matching the top"]',
				],
				nestedFields: {},
			},
			"field-12": {
				name: "穿著狀態",
				type: "STRING",
				presence: "DYNAMIC",
				prompt: "Describe how put-together or disheveled the character appears, including any removed clothing. Note where clothing items from outfit were discarded.",
				defaultValue: "<目前穿著狀態；若角色有脫衣，請注明脫下衣物的放置位置>",
				exampleValues: ['["Professionally dressed, neat appearance", "Professionally dressed, attentive", "Professionally dressed, organized"]', '["Workout attire, lightly perspiring", "Workout attire, energized"]', '["Shirt and sandals removed, placed on beach towel", "Sundress and hat removed, placed on beach chair"]'],
				nestedFields: {},
			},
			"field-13": {
				name: "姿勢與互動",
				type: "STRING",
				presence: "DYNAMIC",
				prompt: "Describe physical posture, position relative to others or objects, and interactions.",
				defaultValue: "<目前姿勢與互動，無需更新時保持不變>",
				exampleValues: ['["Standing at the podium, presenting slides, holding a laser pointer", "Sitting at the conference table, taking notes on a laptop", "Sitting next to James, reviewing printed documents"]', '["Lifting weights at the bench press, focused on form", "Running on the treadmill at a steady pace"]', '["Standing at the water\'s edge, feet in the surf", "Lying on a beach towel, sunbathing with eyes closed"]'],
				nestedFields: {},
			},
		},
	},
};

const trackerPreviewSelector = ".mes_block .mes_text";
const trackerPreviewPlacement = "before";

const numberOfMessages = 5;
const generateFromMessage = 3;
const minimumDepth = 0;

const responseLength = 0;

//#endregion

export const defaultSettings = {
	enabled: true,
	selectedProfile: "current",
	selectedCompletionPreset: "current",
	generationTarget: generationTargets.BOTH,
	showPopupFor: generationTargets.NONE,
	trackerFormat: trackerFormat.YAML,

	generationMode: generationModes.SINGLE_STAGE,

	generateContextTemplate: generateContextTemplate,
	generateSystemPrompt: generateSystemPrompt,
	generateRequestPrompt: generateRequestPrompt,
	generateRecentMessagesTemplate: generateRecentMessagesTemplate,

	messageSummarizationContextTemplate: "",
	messageSummarizationSystemPrompt: "",
	messageSummarizationRequestPrompt: "",
	messageSummarizationRecentMessagesTemplate: "",

	inlineRequestPrompt: "",

	characterDescriptionTemplate: characterDescriptionTemplate,

	mesTrackerTemplate: mesTrackerTemplate,
	mesTrackerJavascript: mesTrackerJavascript,
	trackerDef: trackerDef,

	trackerPreviewSelector: trackerPreviewSelector,
	trackerPreviewPlacement: trackerPreviewPlacement,

	numberOfMessages: numberOfMessages,
	generateFromMessage: generateFromMessage,
	minimumDepth: minimumDepth,
	responseLength: responseLength,
	selectedPreset: "Default-SingleStage",
	presets: {
		"Default-SingleStage": {
			generationMode: generationModes.SINGLE_STAGE,

			generateContextTemplate: generateContextTemplate,
			generateSystemPrompt: generateSystemPrompt,
			generateRequestPrompt: generateRequestPrompt,
			generateRecentMessagesTemplate: generateRecentMessagesTemplate,

			messageSummarizationContextTemplate: "",
			messageSummarizationSystemPrompt: "",
			messageSummarizationRequestPrompt: "",
			messageSummarizationRecentMessagesTemplate: "",

			inlineRequestPrompt: "",

			characterDescriptionTemplate: characterDescriptionTemplate,

			mesTrackerTemplate: mesTrackerTemplate,
			mesTrackerJavascript: mesTrackerJavascript,
			trackerDef: trackerDef,
		},
		"Default-TwoStage": {
			generationMode: generationModes.TWO_STAGE,

			generateContextTemplate: twoStageGenerateContextTemplate,
			generateSystemPrompt: twoStageGenerateSystemPrompt,
			generateRequestPrompt: twoStageGenerateRequestPrompt,
			generateRecentMessagesTemplate: generateRecentMessagesTemplate,

			messageSummarizationContextTemplate: messageSummarizationContextTemplate,
			messageSummarizationSystemPrompt: messageSummarizationSystemPrompt,
			messageSummarizationRequestPrompt: messageSummarizationRequestPrompt,
			messageSummarizationRecentMessagesTemplate: messageSummarizationRecentMessagesTemplate,

			inlineRequestPrompt: "",

			characterDescriptionTemplate: characterDescriptionTemplate,

			mesTrackerTemplate: mesTrackerTemplate,
			mesTrackerJavascript: mesTrackerJavascript,
			trackerDef: trackerDef,
		},
		"Default-Inline": {
			generationMode: generationModes.INLINE,

			generateContextTemplate: generateContextTemplate,
			generateSystemPrompt: generateSystemPrompt,
			generateRequestPrompt: generateRequestPrompt,
			generateRecentMessagesTemplate: generateRecentMessagesTemplate,

			messageSummarizationContextTemplate: "",
			messageSummarizationSystemPrompt: "",
			messageSummarizationRequestPrompt: "",
			messageSummarizationRecentMessagesTemplate: "",

			inlineRequestPrompt: inlineRequestPrompt,

			characterDescriptionTemplate: characterDescriptionTemplate,

			mesTrackerTemplate: mesTrackerTemplate,
			mesTrackerJavascript: mesTrackerJavascript,
			trackerDef: trackerDef,
		},
	},
	debugMode: false,
};
