/**
 * Simpl'IT Aria — Gemini Proxy
 * Add this as a PHP snippet in WPCode
 * The API key never appears in any public file
 */

add_action('rest_api_init', function () {

    // ── Aria chat endpoint ──────────────────────────────────────
    register_rest_route('simplit/v1', '/aria', [
        'methods'             => 'POST',
        'callback'            => 'simplit_aria_proxy',
        'permission_callback' => '__return_true',
    ]);

    // ── Proposal generator endpoint ─────────────────────────────
    register_rest_route('simplit/v1', '/proposal', [
        'methods'             => 'POST',
        'callback'            => 'simplit_proposal_proxy',
        'permission_callback' => '__return_true',
    ]);

});

// ── ARIA PROXY ───────────────────────────────────────────────────
function simplit_aria_proxy(WP_REST_Request $request) {

    $GEMINI_KEY = defined('SIMPLIT_GEMINI_KEY') ? SIMPLIT_GEMINI_KEY : ''; 

    $body     = $request->get_json_params();
    $contents = isset($body['contents']) ? $body['contents'] : [];

    if (empty($contents)) {
        return new WP_Error('bad_request', 'No contents provided', ['status' => 400]);
    }

    $payload = [
        'contents'          => $contents,
        'generationConfig'  => [
            'temperature'   => 0.7,
            'maxOutputTokens' => 1500,
            'topP'          => 0.9,
        ],
    ];

    $response = wp_remote_post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . $GEMINI_KEY,
        [
            'headers' => ['Content-Type' => 'application/json'],
            'body'    => json_encode($payload),
            'timeout' => 30,
        ]
    );

    if (is_wp_error($response)) {
        return new WP_Error('gemini_error', $response->get_error_message(), ['status' => 500]);
    }

    $data = json_decode(wp_remote_retrieve_body($response), true);
    return rest_ensure_response($data);
}

// ── PROPOSAL PROXY ───────────────────────────────────────────────
function simplit_proposal_proxy(WP_REST_Request $request) {

    $GEMINI_KEY = defined('SIMPLIT_PROPOSAL_KEY') ? SIMPLIT_PROPOSAL_KEY : ''; 

    $body   = $request->get_json_params();
    $prompt = isset($body['prompt']) ? $body['prompt'] : '';

    if (empty($prompt)) {
        return new WP_Error('bad_request', 'No prompt provided', ['status' => 400]);
    }

    $payload = [
        'contents' => [
            ['role' => 'user', 'parts' => [['text' => $prompt]]]
        ],
        'generationConfig' => [
            'temperature'     => 0.7,
            'maxOutputTokens' => 3000,
        ],
    ];

    $response = wp_remote_post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . $GEMINI_KEY,
        [
            'headers' => ['Content-Type' => 'application/json'],
            'body'    => json_encode($payload),
            'timeout' => 60,
        ]
    );

    if (is_wp_error($response)) {
        return new WP_Error('gemini_error', $response->get_error_message(), ['status' => 500]);
    }

    $data = json_decode(wp_remote_retrieve_body($response), true);
    return rest_ensure_response($data);
}
