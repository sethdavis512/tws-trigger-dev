import { ai } from '~/ai';
import type { Route } from './+types/completion';
import { data } from 'react-router';

export async function action({ request }: Route.ActionArgs) {
    if (request.method === 'POST') {
        const form = await request.formData();
        const content = String(form.get('content'));

        const textResult = await ai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant'
                },
                {
                    role: 'user',
                    content
                }
            ],
            temperature: 0.8
        });

        const choice = textResult.choices?.[0];

        if (!choice || !choice.message?.content) {
            throw new Error('No content, retrying…');
        }

        return data({ text: choice.message.content });
    }
}
