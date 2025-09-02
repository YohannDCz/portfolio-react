'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createClient } from '@supabase/supabase-js';
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle, Clock, Eye, Mail, MessageSquare, Reply, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const statusConfig = {
  new: { label: 'Nouveau', color: 'bg-blue-100 text-blue-800', icon: MessageSquare },
  read: { label: 'Lu', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  replied: { label: 'Répondu', color: 'bg-green-100 text-green-800', icon: CheckCircle }
};

const languageConfig = {
  fr: '🇫🇷 Français',
  en: '🇬🇧 English', 
  hi: '🇮🇳 हिंदी',
  ar: '🇸🇦 العربية'
};

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');

  // Charger les messages
  const fetchMessages = async () => {
    try {
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (languageFilter !== 'all') {
        query = query.eq('language', languageFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter, languageFilter]);

  // Marquer comme lu
  const markAsRead = async (messageId) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', messageId);

      if (error) throw error;
      
      // Mettre à jour l'état local
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      ));

      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => ({ ...prev, status: 'read' }));
      }
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
    }
  };

  // Marquer comme répondu
  const markAsReplied = async (messageId) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'replied' })
        .eq('id', messageId);

      if (error) throw error;
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'replied' } : msg
      ));

      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => ({ ...prev, status: 'replied' }));
      }
    } catch (err) {
      console.error('Erreur lors du marquage comme répondu:', err);
    }
  };

  // Supprimer un message
  const deleteMessage = async (messageId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    if (message.status === 'new') {
      markAsRead(message.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Messages de Contact</h1>
        <p className="text-muted-foreground">Gérez les messages reçus via le formulaire de contact</p>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="new">Nouveaux</SelectItem>
            <SelectItem value="read">Lus</SelectItem>
            <SelectItem value="replied">Répondus</SelectItem>
          </SelectContent>
        </Select>

        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par langue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les langues</SelectItem>
            <SelectItem value="fr">🇫🇷 Français</SelectItem>
            <SelectItem value="en">🇬🇧 English</SelectItem>
            <SelectItem value="hi">🇮🇳 हिंदी</SelectItem>
            <SelectItem value="ar">🇸🇦 العربية</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Button variant="outline" onClick={fetchMessages}>
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des messages */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            Messages ({messages.length})
          </h2>
          
          {messages.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                <p>Aucun message trouvé</p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => {
              const StatusIcon = statusConfig[message.status].icon;
              return (
                <Card 
                  key={message.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedMessage?.id === message.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleMessageClick(message)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {message.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {message.email}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={statusConfig[message.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[message.status].label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {languageConfig[message.language] || message.language}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {message.subject && (
                      <p className="font-medium text-sm mb-2">
                        Sujet: {message.subject}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {message.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(message.created_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Détail du message sélectionné */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {selectedMessage.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {selectedMessage.email}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={statusConfig[selectedMessage.status].color}>
                      {statusConfig[selectedMessage.status].label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {languageConfig[selectedMessage.language] || selectedMessage.language}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Informations du message */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Clock className="h-4 w-4" />
                    Reçu le {format(new Date(selectedMessage.created_at), 'PPP à HH:mm', { locale: fr })}
                  </div>
                  
                  {selectedMessage.subject && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Sujet:</h3>
                      <p className="text-sm bg-muted p-3 rounded-lg">
                        {selectedMessage.subject}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold mb-2">Message:</h3>
                    <div className="text-sm bg-muted p-4 rounded-lg whitespace-pre-wrap">
                      {selectedMessage.message}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Votre message'}&body=%0D%0A%0D%0A---%0D%0AMessage original:%0D%0A${selectedMessage.message.replace(/\n/g, '%0D%0A')}`}>
                    <Button className="flex items-center gap-2">
                      <Reply className="h-4 w-4" />
                      Répondre par email
                    </Button>
                  </a>
                  
                  {selectedMessage.status !== 'replied' && (
                    <Button 
                      variant="outline"
                      onClick={() => markAsReplied(selectedMessage.id)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Marquer comme répondu
                    </Button>
                  )}
                  
                  <Button 
                    variant="destructive"
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Mail className="mx-auto h-16 w-16 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sélectionnez un message</h3>
                <p>Cliquez sur un message dans la liste pour voir les détails</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
