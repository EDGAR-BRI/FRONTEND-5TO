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