import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// 1. Import ONLY the icons needed for the UI buttons
import { Plus, Trash2, Power, PowerOff, Briefcase } from "lucide-react";

// 2. Import the shared icon dictionary!
import { ICON_MAP } from '@/lib/iconMap';

export default function CategoryManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Category Form State
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Briefcase');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (!error && data) setCategories(data);
    setIsLoading(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('service_categories').insert([{
        name: newName.trim(),
        description: newDesc.trim(),
        icon_name: selectedIcon
      }]);

      if (error) throw error;
      
      setNewName('');
      setNewDesc('');
      setSelectedIcon('Briefcase');
      fetchCategories();
    } catch (error: any) {
      alert(error.message || "Failed to add category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('service_categories')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    
    if (!error) {
      setCategories(categories.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
    }
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure? This might affect pros who already selected this category.")) return;
    const { error } = await supabase.from('service_categories').delete().eq('id', id);
    if (!error) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 p-4 sm:p-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-indigo-500" /> Service Categories
        </h1>
        <p className="text-slate-400 mt-1">Manage the services available on your marketplace.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD NEW CATEGORY FORM */}
        <Card className="bg-slate-900 border-slate-800 lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-white">Add New Service</CardTitle>
            <CardDescription className="text-slate-400">Instantly deploy a new category to the apps.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCategory} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-300">Category Name</Label>
                <Input 
                  placeholder="e.g. Pest Control" 
                  value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white focus-visible:ring-indigo-500" required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-300">Short Description</Label>
                <Input 
                  placeholder="e.g. Termite and bug removal" 
                  value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white focus-visible:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Select Icon</Label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                  {Object.keys(ICON_MAP).map((iconName) => {
                    const IconCmp = ICON_MAP[iconName];
                    return (
                      <button
                        key={iconName} type="button"
                        onClick={() => setSelectedIcon(iconName)}
                        title={iconName}
                        className={`p-3 rounded-lg flex items-center justify-center transition-all ${
                          selectedIcon === iconName ? 'bg-indigo-500 text-white shadow-md scale-110' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                        }`}
                      >
                        <IconCmp className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting || !newName} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                {isSubmitting ? "Saving..." : <><Plus className="w-4 h-4 mr-2"/> Create Category</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* LIST OF CATEGORIES */}
        <Card className="bg-slate-900 border-slate-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Active Services Database</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-slate-500">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No categories found. Create your first one!</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {categories.map((cat) => {
                  const IconCmp = ICON_MAP[cat.icon_name] || Briefcase;
                  return (
                    <div key={cat.id} className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${cat.is_active ? 'hover:bg-slate-800/30' : 'bg-slate-950/50 opacity-70'}`}>
                      
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${cat.is_active ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                          <IconCmp className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-lg">{cat.name}</h4>
                            {!cat.is_active && <Badge variant="outline" className="text-slate-500 border-slate-700">Draft / Hidden</Badge>}
                          </div>
                          <p className="text-sm text-slate-400 mt-0.5">{cat.description || 'No description provided.'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button 
                          variant="outline" size="sm" 
                          onClick={() => toggleStatus(cat.id, cat.is_active)}
                          className={`flex-1 sm:flex-none border-slate-700 ${cat.is_active ? 'text-amber-500 hover:text-amber-400' : 'text-green-500 hover:text-green-400'} hover:bg-slate-800`}
                        >
                          {cat.is_active ? <><PowerOff className="w-4 h-4 mr-2" /> Disable</> : <><Power className="w-4 h-4 mr-2" /> Enable</>}
                        </Button>
                        <Button 
                          variant="outline" size="icon"
                          onClick={() => deleteCategory(cat.id)}
                          className="border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}