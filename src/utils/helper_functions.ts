export const getInitials = (name: string | null): string | null => {
    if(name == null) 
      return null
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join("");
};
export function convertirAFechaISO(fechaStr: string): string {
    // Si ya viene en formato aaaa-mm-dd, devolverlo directamente
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
        return fechaStr;
    }
    
    // Intentar parsear la fecha
    const fecha = new Date(fechaStr);
    
    // Verificar si la fecha es válida
    if (isNaN(fecha.getTime())) {
        throw new Error(`Formato de fecha inválido: ${fechaStr}`);
    }
    
    // Extraer año, mes y día
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    
    return `${año}-${mes}-${dia}`;
}
export function convertirAHHMM(value: string): string {
    if (/^\d{2}:\d{2}$/.test(value)) return value

    const date = new Date(value)
    return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
    })
}