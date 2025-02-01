import { DeepSeekClient, ChatMessage } from '../../core/deepseek/DeepSeekClient';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DeepSeekClient', () => {
    const mockConfig = {
        apiKey: 'test-api-key',
        model: 'test-model',
        temperature: 0.7
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockedAxios.create.mockReturnValue(mockedAxios as any);
    });

    describe('constructor', () => {
        it('should create instance with default values', () => {
            const client = new DeepSeekClient(mockConfig);
            expect(mockedAxios.create).toHaveBeenCalledWith({
                baseURL: 'https://api.deepseek.com/v1',
                headers: {
                    'Authorization': 'Bearer test-api-key',
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });
        });

        it('should use custom baseURL when provided', () => {
            const client = new DeepSeekClient({
                ...mockConfig,
                apiBaseUrl: 'https://custom.api.com'
            });
            expect(mockedAxios.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    baseURL: 'https://custom.api.com'
                })
            );
        });
    });

    describe('createChatCompletion', () => {
        const mockMessages: ChatMessage[] = [
            { role: 'system', content: 'You are a helper' },
            { role: 'user', content: 'Hello' }
        ];

        const mockResponse = {
            data: {
                id: 'test-id',
                object: 'chat.completion',
                created: Date.now(),
                model: 'test-model',
                choices: [
                    {
                        index: 0,
                        message: {
                            role: 'assistant',
                            content: 'Hello! How can I help you?'
                        },
                        finish_reason: 'stop'
                    }
                ],
                usage: {
                    prompt_tokens: 10,
                    completion_tokens: 20,
                    total_tokens: 30
                }
            }
        };

        it('should make successful API call', async () => {
            mockedAxios.post.mockResolvedValueOnce(mockResponse);

            const client = new DeepSeekClient(mockConfig);
            const result = await client.createChatCompletion({ messages: mockMessages });

            expect(mockedAxios.post).toHaveBeenCalledWith(
                '/chat/completions',
                expect.objectContaining({
                    messages: mockMessages,
                    model: 'test-model',
                    temperature: 0.7
                })
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('should handle API errors', async () => {
            const errorResponse = {
                response: {
                    status: 401,
                    data: {
                        error: {
                            message: 'Invalid API key'
                        }
                    }
                }
            };
            mockedAxios.post.mockRejectedValueOnce(errorResponse);

            const client = new DeepSeekClient(mockConfig);
            await expect(
                client.createChatCompletion({ messages: mockMessages })
            ).rejects.toThrow('Invalid API key');
        });

        it('should handle network errors', async () => {
            const networkError = {
                request: {},
                message: 'Network Error'
            };
            mockedAxios.post.mockRejectedValueOnce(networkError);

            const client = new DeepSeekClient(mockConfig);
            await expect(
                client.createChatCompletion({ messages: mockMessages })
            ).rejects.toThrow('Failed to connect to DeepSeek API');
        });

        it('should use default values when not provided', async () => {
            mockedAxios.post.mockResolvedValueOnce(mockResponse);

            const client = new DeepSeekClient({ apiKey: 'test-api-key' });
            await client.createChatCompletion({ messages: mockMessages });

            expect(mockedAxios.post).toHaveBeenCalledWith(
                '/chat/completions',
                expect.objectContaining({
                    model: 'deepseek-chat',
                    temperature: 0.7,
                    max_tokens: 2000
                })
            );
        });
    });

    describe('prompt generation', () => {
        it('should generate correct system prompt', () => {
            const prompt = DeepSeekClient.generateSystemPrompt('draft-07');
            expect(prompt).toContain('JSON Schema draft-07');
            expect(prompt).toContain('detailed descriptions');
            expect(prompt).toContain('appropriate examples');
        });

        it('should generate correct user prompt', () => {
            const json = '{"name": "test"}';
            const prompt = DeepSeekClient.generateUserPrompt(json);
            expect(prompt).toContain(json);
            expect(prompt).toContain('generate a JSON Schema');
        });
    });
});
