import { ref, readonly } from 'vue';

const dialog = ref(false);
const loading = ref(false);
const title = ref('');
const message = ref('');
const color = ref('primary');

let resolvePromise: (value: boolean) => void;

export function useConfirm() {
    const show = (options: { title: string; message: string; color?: string }) => {
        title.value = options.title;
        message.value = options.message;
        color.value = options.color || 'primary';
        dialog.value = true;
        loading.value = false;
        return new Promise<boolean>((resolve) => {
            resolvePromise = resolve;
        });
    };

    const onConfirm = () => {
        loading.value = true;
        resolvePromise(true);
    };

    const onCancel = () => {
        resolvePromise(false);
        dialog.value = false;
    };

    const close = () => {
        dialog.value = false;
        loading.value = false;
    }

    return {
        show,
        onConfirm,
        onCancel,
        close,
        dialog: readonly(dialog),
        loading: readonly(loading),
        title: readonly(title),
        message: readonly(message),
        color: readonly(color),
    };
}
