import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
  Image,
} from 'react-native'
import Icon from '@expo/vector-icons/Feather'
import * as ImagePicker from 'expo-image-picker'
import * as SecureStore from 'expo-secure-store'

import NlWLogo from '../src/assets/nlw-spacetime-logo.svg'
import { Link, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState } from 'react'
import { api } from '../src/lib/api'

export default function NewMemory() {
  const router = useRouter()

  const { bottom, top } = useSafeAreaInsets()

  const [preview, setPreview] = useState<string | null>(null)

  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  async function openImagePicker() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      })

      if (result.assets[0]) {
        setPreview(result.assets[0].uri)
      }
    } catch (err) {}
  }

  async function handleCreateMemory() {
    try {
      const token = await SecureStore.getItemAsync('token')

      let coverUrl = ''

      if (preview) {
        const uploadFormatData = new FormData()

        uploadFormatData.append('file', {
          uri: preview,
          name: 'image.jpg',
          type: 'image/jpeg',
        } as any)

        const uploadResponse = await api.post('/upload', uploadFormatData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        coverUrl = uploadResponse.data.fileUrl
      }

      await api.post(
        '/memories',
        {
          content,
          isPublic,
          coverUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      router.push('/memories')
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
    <ScrollView
      className="flex-1 px-8"
      contentContainerStyle={{
        paddingBottom: bottom,
        paddingTop: top,
      }}
    >
      <View className="mt-4 flex-row items-center justify-between">
        <NlWLogo />

        <Link href="/memories" asChild>
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-purple-500">
            <Icon name="arrow-left" size={16} color="#FFF" />
          </TouchableOpacity>
        </Link>
      </View>

      <View className="mt-6 space-y-6">
        <View className="flex-row items-center gap-2">
          <Switch
            trackColor={{ false: '#767577', true: '#372560' }}
            thumbColor={isPublic ? '#9b79ea' : '#9e9ea0'}
            value={isPublic}
            onValueChange={setIsPublic}
          />
          <Text className="font-body text-base text-gray-200">
            Tornar memória pública
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          className="h-32 items-center justify-center rounded-lg border border-dashed border-gray-500 bg-black/20"
          onPress={openImagePicker}
        >
          {preview ? (
            <Image
              source={{ uri: preview }}
              className="h-full w-full rounded-lg object-cover"
              alt=""
            />
          ) : (
            <View className="flex-row items-center gap-2">
              <Icon name="image" color="#FFF" />
              <Text className="font-body text-sm text-gray-200">
                Adicionar foto ou vídeo de capa
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          multiline
          value={content}
          textAlignVertical="top"
          onChangeText={setContent}
          className="p-0 font-body text-gray-50"
          placeholderTextColor="#56565a"
          placeholder="Fique livre para adicionar fotos, vídeos e relatos sobre essa experiência que você quer lembrar para sempre."
        />

        <TouchableOpacity
          activeOpacity={0.7}
          className="items-center self-end rounded-full bg-green-500 px-5 py-2"
          onPress={handleCreateMemory}
        >
          <Text className="font-alt text-sm uppercase text-black">Salvar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
